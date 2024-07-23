const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const User = require("../models/user.model");
const { sendConfirmationEmail, sendPasswordToken } = require("../config/email.config");
const PasswordToken = require("../models/passwordToken.model");
const { generateTempToken } = require("../util/generateToken");
const catchedAsync = require("../util/catchedAsync");


const secretKey = process.env.JWT_SECRET_KEY;

/* Controladores Basicos CRUD */
module.exports.createUser = catchedAsync(async (req, res) => {
    const newUser = await User.create(req.body);
    const emailResponse = await sendConfirmationEmail(req.body);
    console.log(emailResponse);
    res.status(200).json(newUser);
});

module.exports.findAllUsers = catchedAsync(async (req, res) => {
    const { base } = req.query;
    let includes = base ? "" : "email firstName lastName _id";
    const users = await User.find().select(includes);
    res.status(200).json(users);
});

module.exports.findUser = catchedAsync(async (req, res) => {
    const user = await User.findOne({ _id: req.params.id });
    if (user) {
        res.status(200).json(user);
        return;
    }
    res.status(404).json({ error: "User not found" });
});

module.exports.updateUser = catchedAsync(async (req, res) => {
    const updatedUser = await User.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, runValidators: true });
    res.status(200).json(updatedUser);
});

module.exports.deleteUser = catchedAsync(async (req, res) => {
    const deletedUser = await User.deleteOne({ _id: req.params.id });
    res.status(200).json(deletedUser);
});

/* METODOS DE SESSION */
module.exports.login = catchedAsync(async (req, res) => {
    /* Buscar el usuario */
    const user = await User.findOne({ email: req.body.email });
    /* Si no existe paro y retorno resultado */
    if (user === null) {
        res.status(404).json({
            errors: {
                email: {
                    message: "user not found"
                }
            }
        });
        return;
    }
    /* Si existe revisamos contraseñas */
    const validatePassword = await bcrypt.compare(req.body.password, user.password);
    /* Si contraseña no coincide paro y retorno resultado */
    if (validatePassword === false) {
        res.status(400).json({
            errors: {
                password: {
                    message: "Wrong Password"
                }
            }
        });
        return;
    }
    /* Si contraseña ok generar jwt y cookie */
    const newJWT = jwt.sign({
        _id: user._id,
        level: user.level
    }, secretKey, { expiresIn: '10y' });

    res.cookie("userToken", newJWT, {
        /* domain: "testdomain.com", */
        /* httpOnly: true */
    });
    res.status(200);
    const rsUser = {
        _id: user._id,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
    };

    res.json({ user: rsUser, token: newJWT });
});

module.exports.logout = catchedAsync(async (req, res) => {
    res.clearCookie('userToken');
    res.clearCookie('info');
    res.status(200).json({ msg: 'Logout successful.' });
});

/* RESET PASSWORD */
module.exports.passwordResetToken = catchedAsync(async (req, res) => {
    const { email } = req.query;
    console.log(email);
    /* Buscamos si existe usuario con el email */
    const user = await User.findOne({ email: email });
    if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
    }
    /* Buscamos si ese usuario que si existe ya tiene un token */
    const token = await PasswordToken.findOne({ user: user._id });
    console.log(token);
    /* Si tiene Token lo eliminamos */
    if (token) {
        await PasswordToken.deleteOne({ _id: token._id });
    }
    /* Generacion Token */
    const rawToken = generateTempToken(6);
    const newToken = await PasswordToken.create({ token: rawToken, user: user._id, valid: true });
    const emailToken = await sendPasswordToken({ user: user, token: rawToken });
    /* console.log(emailToken); */
    res.status(200).json(newToken);
});

module.exports.passwordReset = catchedAsync(async (req, res) => {
    const { email, password, confirmPassword, token } = req.body;
    const data = { password, confirmPassword };
    console.log(email, password, confirmPassword, token);
    /* Busca el usuario por email */
    const user = await User.findOne({ email: email });
    /* Si no existe finaliza */
    if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
    }
    /* Busca si el usuario tiene token activo */
    const activeToken = await PasswordToken.findOne({ user: user._id });
    console.log(token);
    /* Si no hay token o el token ya no es válido */
    if (!activeToken || !activeToken.valid) {
        res.status(401).json({ error: "Token Expired" });
        return;
    }
    /* Valida el token ingresado con el hash de la DB */
    const validate = await bcrypt.compare(token, activeToken.token);
    /* Si no concuerdan, Finaliza */
    if (!validate) {
        res.status(401).json({ error: "Invalid Token" });
        return;
    }

    /* Actualizacion de contraseña */
    const userPatch = await User.findOneAndUpdate({ email: email }, data, { new: true, runValidators: true });
    /* Quema el token (lo vuelve inválido) */
    const tokenPatch = await PasswordToken.findOneAndUpdate({ user: user._id }, { valid: false }, { new: true, runValidators: true });
    console.log(tokenPatch);
    res.status(200).json(userPatch);
});
