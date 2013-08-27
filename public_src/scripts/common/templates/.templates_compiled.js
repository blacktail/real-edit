define(['handlebars'], function(Handlebars) {

this["JST"] = this["JST"] || {};

this["JST"]["public_src/scripts/common/alert"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div class=\"alert alert-";
  if (stack1 = helpers.type) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.type; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + " ";
  if (stack1 = helpers.custClass) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.custClass; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + " fade in\" id=\"";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\">\r\n	<button type=\"button\" data-dismiss=\"alert\" class=\"close\">&times;</button>\r\n	<span>";
  if (stack1 = helpers.msg) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.msg; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</span>\r\n</div>\r\n";
  return buffer;
  });

this["JST"]["public_src/scripts/common/partials/footer"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div id=\"footer\"><p class=\"copyright\">Copyright ⓒ<a class=\"corp\">NHN Corp.</a>All Rights Reserved.</p></div>";
  });

return this["JST"];

});