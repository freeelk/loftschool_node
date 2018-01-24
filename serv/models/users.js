module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define('users', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    firstName: {
      type: DataTypes.CHAR(50),
      allowNull: false
    },
    surName: {
      type: DataTypes.CHAR(50)
    },
    middleName: {
      type: DataTypes.CHAR(50)
    },
    username: {
      type: DataTypes.CHAR(20),
      unique: 'usernameIndex'
    },
    password: {
      type: DataTypes.CHAR(255),
      allowNull: false
    },
    access_token: {
      type: DataTypes.CHAR(255),
      unique: 'accessTokenIndex'
    },
    permissionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: 'permissionIndex'
    },
    image: {
      type: DataTypes.CHAR
    }
  });

  Users.associate = function (models) {
    Users.hasMany(models.permissions, {foreignKey: 'id', sourceKey: 'permissionId'});
  };

  return Users;
};
