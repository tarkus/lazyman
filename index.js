// Generated by CoffeeScript 1.6.3
(function() {
  var config, file, files, fs, fullpath, jade, mailer, path, send_function, templates, transport, _, _i, _len;

  fs = require('fs');

  path = require('path');

  jade = require('jade');

  mailer = require('nodemailer');

  _ = require('underscore');

  config = {
    smtp: {
      service: "Mandrill",
      auth: {
        user: "tarkus@fuyun.io",
        pass: "OzWxBGIKRBs7IZrOvsUEWg"
      }
    },
    view_path: "" + __dirname + "/../../views/mailer"
  };

  templates = {};

  files = fs.readdirSync(config.view_path);

  if (files) {
    for (_i = 0, _len = files.length; _i < _len; _i++) {
      file = files[_i];
      fullpath = path.join(config.view_path, file);
      templates[path.basename(file, '.jade')] = fs.readFileSync(fullpath).toString();
    }
  }

  transport = mailer.createTransport('SMTP', config.smtp);

  send_function = function(req, res, next) {
    return function(mail, options, variables, callback) {
      var defaults;
      defaults = {
        from: "币讯 <noreply@btcxun.com>"
      };
      if (typeof variables === 'function') {
        callback = variables;
        variables = {};
      }
      options = _.extend(options, defaults);
      if (options.to == null) {
        return callback("No Recipient");
      }
      if (templates["" + mail + ".txt"] == null) {
        return callback("No Such Mail");
      }
      if (!options.subject) {
        options.subject = res.locals.t("mailer." + mail + ".subject");
      }
      if (options.text || options.html) {
        return transport.sendMail(options, callback);
      }
      variables.t = res.locals.t;
      return jade.render(templates["" + mail + ".txt"], variables, function(err, text) {
        if (err) {
          return callback(err);
        }
        options.text = text;
        if (!(templates["" + mail + ".html"] && templates['layout.html'])) {
          return transport.sendMail(options, callback);
        }
        return jade.render(templates['layout.html'], function(err, html) {
          options.html = html;
          return jade.render(templates["" + mail + ".html"], variables, function(err, html) {
            options.html += html;
            return transport.sendMail(options, callback);
          });
        });
      });
    };
  };

  exports.connect = function() {
    return function(req, res, next) {
      res.locals.sendmail = send_function(req, res, next);
      return next();
    };
  };

}).call(this);
