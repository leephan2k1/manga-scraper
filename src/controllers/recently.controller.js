module.exports = {
    getManga: async (req, res, next) => {
        res.status(200).json({ data: 'recently manga' });
    },
};
