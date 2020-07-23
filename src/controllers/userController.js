const profiles = require('../services/profiles')
const downloadResource = require('./util');
const { Parser } = require("json2csv")

const controller = {};

controller.download = (req, res) => {
    try {

        const fields = [
            //"role", "company", "description", "area"
            {
                label: 'Role',
                value: 'role'
            },
            {
                label: 'Company',
                value: 'company'
            },
            {
                label: 'Description',
                value: 'description'
            },
            {
                label: 'Area',
                value: 'area'
            }
        ];

        // return downloadResource(res, 'profiles.csv', fields, req.experiences);

        const json2csv = new Parser({ fields });
        const csv = json2csv.parse(req.experiences);

        res.header('Content-Type', 'text/csv');
        res.attachment('profiles.csv');

        return res.send(csv);

    } catch (error) {
        console.log("here catching")
        res.status(500).send(error.message)
    }
}

module.exports = controller;