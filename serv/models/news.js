module.exports = (sequelize, DataTypes) => {
  const News = sequelize.define('news', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    text: {
      type: DataTypes.TEXT
    },
    theme: {
      type: DataTypes.CHAR(255)
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });

  News.associate = function (models) {
    News.belongsTo(models.users, {foreignKey: 'userId', sourceKey: 'id'});
  };

  return News;
};
