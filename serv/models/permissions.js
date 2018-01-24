module.exports = (sequelize, DataTypes) => {
    const Permissions = sequelize.define("permissions", {
        type: {
            type: DataTypes.CHAR(20),
            allowNull: false,
            primaryKey: true
        },
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false
        },
        C: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        R: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        U: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        D: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    });

/*   Permissions.associate = function (models) {
        Permissions.belongsTo(models.users, {foreignKey: 'permissionId', sourceKey: 'id'});
    };*/

    return Permissions ;
};
