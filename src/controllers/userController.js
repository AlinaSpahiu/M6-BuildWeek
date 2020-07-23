const profiles = require('../services/profiles')
const downloadResource = require('./util');

const controller = {};

controller.download = async (req, res) => {
    const fields = [
        {
            label: 'ID',
            value: '_id'
        },
        {
            label: 'Role',
            value: 'role'
        },
        {
            label: 'Company',
            value: 'company'
        }
    ];
    const data = await profiles.findAll();

    return downloadResource(res, 'profiles.csv', fields, data);
}

module.exports = controller;