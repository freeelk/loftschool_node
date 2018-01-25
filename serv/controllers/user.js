const fs = require('fs');
const path = require('path');
const sequelize = require('./../db-connection');
const formidable = require('formidable');
const bcrypt = require('bcryptjs');
const uuidv4 = require('uuidv4');
const cloudinary = require('cloudinary');

/**
 * авторизация после пользователького ввода. Необходимо вернуть объект авторизовавшегося пользователя.
 *
 * @param req
 * @param res
 * @param next
 */
module.exports.login = function (req, res, next) {
  const bodyObj = JSON.parse(req.body);

  sequelize.models.users.find({
    where: {username: bodyObj.username},
    include: [
      {model: sequelize.models.permissions, as: 'permissions'}
    ]
  }).then(user => {
    if (user) {
      if (compareHash(bodyObj.password, user.dataValues.password)) {
        user.dataValues.permission = transformPermissions(user.dataValues.permissions);
        delete user.dataValues.permissions;

        if (bodyObj.remembered) {
          res.cookie('access_token', user.dataValues.access_token, {maxAge: 900000});
        }

        return res.json(user.dataValues);
      } else {
        return next(Error('Ошибка входа'));
      }
    } else {
      return next(Error('Ошибка входа'));
    }
  },
  () => {
    return next(Error('Ошибка входа'));
  }
  );
};

/**
 * авторизация при наличии токена. Необходимо вернуть объект авторизовавшегося пользователя.
 *
 * @param req
 * @param res
 * @param next
 */
module.exports.authFromToken = function (req, res, next) {
  const bodyObj = JSON.parse(req.body);

  sequelize.models.users.find({
    where: {access_token: bodyObj.access_token},
    include: [
      {model: sequelize.models.permissions, as: 'permissions'}
    ]
  }).then(user => {
    if (user) {
      user.dataValues.permission = transformPermissions(user.dataValues.permissions);
      delete user.dataValues.permissions;
      if (bodyObj.remembered) {
        res.cookie('access_token', user.dataValues.access_token, {maxAge: 900000});
      }
      return res.json(user.dataValues);
    } else {
      return next(Error('Ошибка входа'));
    }
  },
  () => {
    return next(Error('Ошибка входа'));
  }
  );
};

/**
 * получение списка пользователей. Необходимо вернуть список всех пользоватлей из базы данных.
 *
 * @param req
 * @param res
 * @param next
 */
module.exports.getUsers = function (req, res, next) {
  sequelize.models.users.findAll(
    {
      include: [
        {model: sequelize.models.permissions}
      ]
    }
  ).then(users => {
    users.forEach(user => {
      user.dataValues.permission = transformPermissions(user.dataValues.permissions);
      delete user.dataValues.permissions;
    });

    return res.json(users);
  },
  error => {
    return next(error);
  }
  );
};

/**
 * создание нового пользователя (регистрация). Необходимо вернуть объект созданного пользователя.
 *
 * @param req
 * @param res
 * @param next
 */
module.exports.saveNewUser = function (req, res, next) {
  const bodyObj = JSON.parse(req.body);
  bodyObj.password = createHash(bodyObj.password);
  const permissions = bodyObj.permission;
  delete bodyObj.permissions;

  sequelize.models.permissions.max('id').then(maxPermissionId => {
    bodyObj.permissionId = isNaN(maxPermissionId) ? 0 : maxPermissionId + 1;
    bodyObj.access_token = uuidv4();

    sequelize.models.users.create(bodyObj).then((user) => {
      Promise.all(savePermissions(bodyObj.permissionId, permissions)).then((data) => {
        sequelize.models.users.find({
          where: {username: bodyObj.username},
          include: [
            {model: sequelize.models.permissions, as: 'permissions'}
          ]
        }).then(user => {
          if (user) {
            user.dataValues.permission = transformPermissions(user.dataValues.permissions);
            delete user.dataValues.permissions;
            return res.json(user.dataValues);
          }
        });
      },
      error => {
        return next(error);
      });
    });
  });
};

/**
 * обновление информации о пользователе. Необходимо вернуть объект обновленного пользователя.
 *
 * @param req
 * @param res
 * @param next
 */
module.exports.updateUser = function (req, res, next) {
  const bodyObj = JSON.parse(req.body);

  console.log('BODY OBJ:', bodyObj);

  if (bodyObj.password) {
    bodyObj.password = createHash(bodyObj.password);
  }

  sequelize.models.users.find({
    where: {id: bodyObj.id},
    include: [
      {model: sequelize.models.permissions, as: 'permissions'}
    ]
  }).then(user => {
    if (user) {
      if (bodyObj.password && !compareHash(bodyObj.oldPassword, user.password)) {
        return next(Error('Старый пароль введен не верно'));
      }

      user.updateAttributes(bodyObj).then(updatedUser => {
        updatedUser.dataValues.permission = transformPermissions(user.dataValues.permissions);
        delete updatedUser.dataValues.permissions;
        return res.json(updatedUser.dataValues);
      });
    }
  });
};

/**
 * удаление пользователя.
 *
 * @param req
 * @param res
 * @param next
 */
module.exports.deleteUser = function (req, res, next) {
  sequelize.models.users.findById(req.params.id).then(user => {
    if (user) {
      user.destroy().then(user => {
        return res.json(user);
      });
    }
  });
};

/**
 * сохранение изображения пользователя. Необходимо вернуть объект со свойством path, которое хранит путь до сохраненного изображения.
 *
 * @param req
 * @param res
 * @param next
 */
module.exports.saveUserImage = function (req, res, next) {
  const form = new formidable.IncomingForm();

  form.parse(req, (err, fields, files) => {
    if (err) {
      return next(err);
    }

    const filePath = files[req.params.id].path;

    if (process.env.CLOUDINARY_URL) {
      // Запущено на heroku. Используем трансформацию изображения
      const stream = cloudinary.v2.uploader.upload_stream((err, result) => {
        if (err) {
          return next(err);
        }

        const url = cloudinary.v2.url(`${result.public_id}.${result.format}`, {
          gravity: 'face',
          height: 200,
          width: 200,
          crop: 'thumb'
        });
        return res.json({path: url});
      });
      fs.createReadStream(filePath).pipe(stream);
    } else {
      // Запущено на локальном сервере
      const uploadDir = 'images/users';
      const savedFilePath = path.join('dist', uploadDir, files[req.params.id].name);
      fs.rename(filePath, savedFilePath, (err) => {
        if (err) {
          fs.unlink(savedFilePath);
          return next(err);
        }

        return res.json({path: path.join(uploadDir, files[req.params.id].name)});
      });
    }
  });
};

/**
 * обновление существующей записи о разрешениях конкретного пользователя.
 *
 * @param req
 * @param res
 * @param next
 */
module.exports.updateUserPermission = function (req, res, next) {
  const bodyObj = JSON.parse(req.body);

  let promises = [];
  for (let type in bodyObj.permission) {
    promises.push(sequelize.models.permissions.findOne({where: {type: type, id: req.params.id}}));
  }

  Promise.all(promises).then(permissions => {
    let updatePromises = [];
    permissions.forEach(permission => {
      let attributes = bodyObj.permission[permission.dataValues.type.trim()];
      updatePromises.push(permission.updateAttributes(attributes));
    });

    Promise.all(updatePromises).then(permissions => {
      return res.json(permissions);
    });
  },
  error => {
    return next(error);
  });
};

function transformPermissions (permissions) {
  let result = {};
  permissions.forEach(item => {
    const data = item.dataValues;

    result[data.type.trim()] = data;
    delete data.type;
  });

  return result;
}

function savePermissions (id, permission) {
  var promises = [];
  for (let type in permission) {
    permission[type].type = type;
    permission[type].id = id;
    promises.push(sequelize.models.permissions.create(permission[type]));
  }

  return promises;
}

/**
 * Создание хеша пароля
 *
 * @param password
 * @returns {string|?string}
 */
function createHash (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10, null));
}

/**
 * Проверка пароля. (Сравнение с хешем)
 *
 * @param password
 * @param hash
 * @returns {boolean}
 */
function compareHash (password, hash) {
  if (!password || !hash) return false;
  return bcrypt.compareSync(password, hash.trim());
}
