const { UserModel } = require('../models');
const STATE = require('../constants/state');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userController = {
  getUser: async (req, res) => {
    try{
      if(req.user.id ===  Number(req.params.id)) {
        const user = await UserModel.findOne({id: req.params.id},['id','nickname','url'])
        res.json(user);
      } else {
        res.status(500).json(STATE.FAIL.NOLOGIN_ERR);
      }
    } catch(err) {
      console.log(err)
      res.status(500).json(STATE.FAIL.DB_ERR);
    }    
  },

  getUsers: async (req, res) => {
    try{
      const query = Object.keys(req.query).reduce((acc, key) => {
        if(req.query[key]) {
          acc[key] = req.query[key];
        } 
        return acc;
      }, {})
      const users = await UserModel.find({
        email: {
          $regex: query.search,
          $options: 'i'
        }
      },['id','nickname','url'],)
      res.json(users);
    } catch(err) {
      res.status(500).json(STATE.FAIL.DB_ERR);
    }   
  },

  addUser: async (req, res) => {
    if(!req.body.email || !req.body.password) {
      res.status(403)
    }
    try {
      const isExist = await UserModel.findOne({email: req.body.email});
      if(isExist) {
        res.status(403).json(STATE.FAIL.EMAIL_ERR);
      } else {
        const user = new UserModel({
          ...req.body,
          password: bcrypt.hashSync(req.body.password, 10),
        });
        await user.save();
        res.status(200).json(STATE.SUCCESS)
      }
    } catch(error) {
      res.status(500).json(STATE.FAIL.DB_ERR);
    }
  },

  updateUser: async (req, res) => {
    try{
      if(req.user.id === Number(req.params.id)) {
        await UserModel.update(
          {id: req.params.id}, 
          req.body);
        res.json(STATE.SUCCESS);
      } else {
        res.status(500).json(STATE.FAIL.NOLOGIN_ERR);
      }
    } catch(err) {
      console.log(err)
      res.status(500).json(STATE.FAIL.DB_ERR);
    }    
  },

  loginUser: async (req, res) => {
    try {
      const user = await UserModel.findOne({email: req.body.email});
      if(!user) {
        res.status(403).json(STATE.FAIL.NOLOGIN_ERR);
      } else {
        const result = await bcrypt.compare(req.body.password, user.password);
        if(result) {
          const payload = {
            userId: user.id,
            nickname: user.nickname,
            url: user.url
          };
          const token = jwt.sign({
            payload,
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
          }, process.env.SECRET_KEY);
          res.status(200).json({...STATE.SUCCESS, token})
        } else {
          res.status(403).json(STATE.FAIL.PASSWORD_ERR);
        }
      }
    } catch(error) {
      res.status(403).json(STATE.FAIL.DB_ERR);
    }
  }
}

module.exports = userController;

