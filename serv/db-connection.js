const fs = require('fs');
const path = require('path');
const Sequelize = require("sequelize");
const databaseConfig = require('./database-config.json');



var sequelize;

function getSequelize() {
    if (sequelize) {
        return sequelize;
    } else {
        sequelize = new Sequelize(databaseConfig.dataBase, databaseConfig.user, databaseConfig.password, databaseConfig.params);
        sequelize.authenticate().then(() => {
                console.log('Соединение установлено.');
            })
            .catch(err => {
                console.error('Ошибка соединения:', err);
            });

        fs.readdirSync('./serv/models').forEach(function (file) {
            sequelize.import(path.join(__dirname, 'models', file));
        });

        Object.keys(sequelize.models).forEach(function (modelName) {
            if ('associate' in sequelize.models[modelName]) {
                sequelize.models[modelName].associate(sequelize.models);
            }
        });

        return sequelize;
    }
}


module.exports = getSequelize();
