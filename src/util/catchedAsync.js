// utils/catchedAsync.js
const catchedAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    }
}

module.exports = catchedAsync;
