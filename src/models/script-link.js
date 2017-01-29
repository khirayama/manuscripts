module.exports = (sequelize, DataTypes) => {
  return sequelize.define('ScriptLink', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    scriptId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'script_id',
    },
    linkId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'link_id',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
    },
  }, {tableName: 'scripts_links'});
};
