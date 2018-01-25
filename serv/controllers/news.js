const sequelize = require('./../db-connection');

/**
 * получение списка новостей. Необходимо вернуть список всех новостей из базы данных.
 *
 * @param req
 * @param res
 * @param next
 */
module.exports.getNews = function (req, res, next) {
  sendAllNews(res, next);
};

/**
 * создание новой новости. Необходимо вернуть обновленный список всех новостей из базы данных.
 *
 * @param req
 * @param res
 * @param next
 */
module.exports.newNews = function (req, res, next) {
  const bodyObj = JSON.parse(req.body);
  sequelize.models.news.create(bodyObj).then((news) => {
    sendAllNews(res, next);
  });
};

/**
 * обновление существующей новости. Необходимо вернуть обновленный список всех новостей из базы данных.
 *
 * @param req
 * @param res
 * @param next
 */
module.exports.updateNews = function (req, res, next) {
  const bodyObj = JSON.parse(req.body);

  sequelize.models.news.findById(req.params.id).then(news => {
    news.updateAttributes(bodyObj).then((news) => {
      sendAllNews(res, next);
    });
  });
};

/**
 * удаление существующей новости. Необходимо вернуть обновленный список всех новостей из базы данных.
 *
 * @param req
 * @param res
 * @param next
 */
module.exports.deleteNews = function (req, res, next) {
  sequelize.models.news.destroy({
    where: {id: req.params.id}
  }).then(() => {
    sendAllNews(res, next);
  });
};

/**
 * Отправляет клиенту список всех новостей
 *
 * @param res
 */
function sendAllNews (res, next) {
  sequelize.models.news.findAll(
    {
      include: [
        {model: sequelize.models.users}
      ]
    }
  ).then(data => {
    return res.json(data);
  },
  error => {
    return next(error);
  }
  );
}
