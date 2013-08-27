define(['handlebars'], function(Handlebars) {

this["JST"] = this["JST"] || {};

Handlebars.registerPartial("public_src/scripts/common/footer", Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div id=\"footer\"><p class=\"copyright\">Copyright ⓒ<a class=\"corp\">NHN Corp.</a>All Rights Reserved.</p></div>";
  }));

return this["JST"];

});