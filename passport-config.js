const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

const UserModel = require('./models/users');
const bcrypt = require('bcrypt');
const config = (app)=>{
    app.use(passport.initialize())
    app.use(passport.session())

    passport.use(new LocalStrategy(UserModel.authenticate()));
    passport.use('login', new LocalStrategy({
        passReqToCallback : true
      },
      function(req, username, password, done) { 
        // check in mongo if a user with username exists or not
        UserModel.findOne({ 'email' :  username }, 
          async (err, user)=> {

            if (err) return done(err);

            if (!user){
              return done(null, false, {message: 'User Not Found with email '+username});
            }
            const validate = await bcrypt.compare(password, user.password);

            if (!validate) {
              return done(null, false, { message: 'Wrong Password' });
            }
    
            return done(null, user, { message: 'Logged in Successfully' });
          }
        );
    }));

    passport.use(
      new JWTstrategy(
        {
          secretOrKey: process.env.JWT_SECRET,
          jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken()
        },
        async (token, done) => {
          try {
            return done(null, token.user);
          } catch (error) {
            done(error);
          }
        }
      )
    );

    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });
    passport.deserializeUser(function(id, done) {
        UserModel.findById(id, function(err, user) {
          done(err, user);
        });
    });
}

module.exports = config;