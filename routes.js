module.exports = app => {

    app.get(`/`, (req, res) => {
        res.sendfile('./public/index.html');
    });

    app.get(`/data`, (req, res) => {
        res.json(funnyStuff);
    });
};