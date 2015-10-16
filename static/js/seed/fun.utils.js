/*
* Fun namespace object
*/
var fun = {
    account: {}, 
    utils: {},
    views: {},
    instances: {},
    containers: {},
    models: {},
    strings: {},
    conf: {},
    session: {}, //account and context maybe?
    cache: {templates : {}},
    omnibus: _.extend({}, Backbone.Events)
};


/*
* Fetches the session from it's container (cookie)
* @return Object: Session data
*/
fun.utils.getSession = function() {
    var session = null;
    
    if ($.cookie){
        session = $.cookie('username');
    }
    return session;
};


/**
 * Tells whether the session has been created or not.
 * @return boolean
 */
fun.utils.loggedIn = function() {
    var session = this.getSession();
    fun.session = session;
    return (session != null);
};


/**
 * Logs the user into the system
 * @param string account: account
 * @param string password: password
 * @param object callbacks: object with success and error callback
 * @return boolean
 */
fun.utils.login = function(account, password, callbacks) {
    $.ajax({
        type: "GET",
        url: fun.conf.urls.login,
        dataType: 'json',
        beforeSend: function(xhr){
            auth = account + ':' + password;
            var words  = CryptoJS.enc.Latin1.parse(auth);
            var base64 = CryptoJS.enc.Base64.stringify(words);
            xhr.setRequestHeader("Authorization", "Basic " + base64);
        },
        success: function (data, textStatus, jqXHR){

            //$.cookie( 'account', account );

            if (_.isFunction(callbacks.success)){
                callbacks.success(data);
            }
        },
        error: function (xhr, textStatus, thrownError){
            if (_.isFunction(callbacks.error)){
                callbacks.error(xhr, textStatus, thrownError);
            }
        }
    });
};


/*
* Subscribe
*/
fun.utils.subscribe = function(callbacks){
    'use strict';
    console.log('fun.utils.subscribe');
    var email = $("#subscribe-email").val(),
        task,
        taskPayload;

    taskPayload = {
        first_name: 'Random',
        last_name: 'Funster',
        title: 'news subscribe',
        description: 'curious and stuff',
        label: 'Home Subscribe',
        email: email,
    };

    task = new fun.models.Task(taskPayload);
    task.save();

    $("#subscribe-email").val('');
};


/**
 * Logout the account
 * @return void
 */
fun.utils.logout = function(callbacks){
    $.ajax({
        url : fun.conf.urls.logout,
        type : 'GET',
        dataType : 'json',
        success : function(data, textStatus, jqXHR) {

            // this is kind of crazy.

            // why? cuz it don't work anymore... 

            if (_.isObject(callbacks) && _.isFunction(callbacks.success)) {
                callbacks.success();
            }

            // Clear the html from the containers
            for (var i in fun.containers) {
                if(i !== 'login' && i !== 'footer' && i !== 'navbar' && i !== 'subheader'){
                    fun.containers[i].empty();
                }
            }
        },
        error : function(jqXHR, textStatus, errorThrown) {
            if (_.isObject(callbacks) && _.isFunction(callbacks.error)) {
                callbacks.error(jqXHR, textStatus, errorThrown);
            }

            // Clear the html from the containers
            for (var i in fun.containers) {
                if(i !== 'login' && i !== 'footer' && i !== 'navbar' && i !== 'subheader'){
                    fun.containers[i].empty();
                }
            }
        }
    });

    // Clean storage outside ajax call, this way we always clean the stuff.
    if (typeof(Storage) != "undefined") {
        localStorage.removeItem('username');
        localStorage.removeItem('profile');
        sessionStorage.removeItem('context');
    }
};


/**
* Checks on the strings object for the specified key.
* If the value doesn't exist the key is returned
* @param string key for the translation requested
* @return The translated value for the specified key
*/
fun.utils.translate = function translate(key) {
    var value = key;
    if (typeof fun.strings[key] != 'undefined') {
        value = fun.strings[key];
    }

    // replace the rest of the arguments into the string
    for( var i = 1; i < arguments.length; i++) {
        value = value.replace('%' + i + '$s', args[i]);
    }

    return value;
}


/**
 * Fetches an html template
 * @return Object
 */
fun.utils.getTemplate = function(url){
    if ( !fun.cache.templates[url] ) {
        var response = $.ajax(url, {
            async : false,
            dataTypeString : 'html'
        });
        fun.cache.templates[url] = response.responseText;
    }
    return fun.cache.templates[url];
};


/**
 * Redirects to a different url #hash
 * @param string url: new location
 * @return Object
 */
fun.utils.redirect = function(url) {
    window.location = url;
};


/**
* check if this stuff works on empty strings
*/
fun.utils.emptyString = function(str) {
    return (!str || 0 === str.length || !str.trim());
};

/**
 * Hide all the UI stuff
 */
fun.utils.hideAll = function() {
    for (var i in fun.containers){
        // hide all containers including footer
        //fun.containers[i].hide();
        fun.containers[i].removeClass("show").addClass("hide");
        //if ( i != 'footer'){
        //    fun.containers[i].hide();
        //}
    }
};


fun.utils.hideLanding = function(){
    $("#landing-00").removeClass("show").addClass("hide");
    $("#landing-01").removeClass("show").addClass("hide");
    $("#landing-02").removeClass("show").addClass("hide");
    $("#landing-03").removeClass("show").addClass("hide");
    $("#landing-04").removeClass("show").addClass("hide");
    $("#landing-05").removeClass("show").addClass("hide");
    $("#call-to-action").removeClass("show").addClass("hide");
};

fun.utils.showLanding = function(){
    $("#landing-00").removeClass("hide").addClass("show");
    $("#landing-01").removeClass("hide").addClass("show");
    $("#landing-02").removeClass("hide").addClass("show");
    $("#landing-03").removeClass("hide").addClass("show");
    $("#landing-04").removeClass("hide").addClass("show");
    $("#landing-05").removeClass("hide").addClass("show");
    $("#call-to-action").removeClass("hide").addClass("show");
};

/**
 * Rounds up a number.
 * @return Object
 */
fun.utils.round = function (number, decimals) {
  if (typeof decimals === 'undefined')
  {
      var decimals = 2;
  }
  var newNumber = Math.round(number*Math.pow(10,decimals))/Math.pow(10,decimals);
  return parseFloat(newNumber);
};


/**
 * validation rules
 * return custom validation rules
 */
fun.utils.validationRules = function () {
    var custom = {
        focusCleanup: false,
        wrapper: 'div',
        errorElement: 'span',
        
        highlight: function(element) {
            $(element).parents ('.control-group').removeClass ('success').addClass('error');
        },
        success: function(element) {
            $(element).parents ('.control-group').removeClass ('error').addClass('success');
            $(element).parents ('.controls:not(:has(.clean))').find ('div:last').before ('<div class="clean"></div>');
        },
        errorPlacement: function(error, element) {
            error.appendTo(element.parents ('.controls'));
        }
    };
    
    return custom;
};

/**
 * string 'join' format
 */
fun.utils.format = function () {
    'use strict';
    var args,
        initial;
    args = [].slice.call(arguments);
    initial = args.shift();

    function replacer (text, replacement) {
        return text.replace('%s', replacement);
    }
    return args.reduce(replacer, initial);
};

/**
 * jQuery validator custom error messages
 * Included fun.utils after the validation plugin to override the messages
 *
 * TODO: validator.messages on fun.strings.js
 */
jQuery.extend(jQuery.validator.messages, {
    required: "This field is required.",
    remote: "Please fix this field.",
    email: "Please enter a valid email address.",
    url: "Please enter a valid URL.",
    date: "Please enter a valid date.",
    dateISO: "Please enter a valid date (ISO).",
    number: "Please enter a valid number.",
    digits: "Please enter only digits.",
    creditcard: "Please enter a valid credit card number.",
    equalTo: "Please enter the same value again.",
    accept: "Please enter a value with a valid extension.",
    maxlength: jQuery.validator.format("Please enter no more than {0} characters."),
    minlength: jQuery.validator.format("Please enter at least {0} characters."),
    rangelength: jQuery.validator.format("Please enter a value between {0} and {1} characters long."),
    range: jQuery.validator.format("Please enter a value between {0} and {1}."),
    max: jQuery.validator.format("Please enter a value less than or equal to {0}."),
    min: jQuery.validator.format("Please enter a value greater than or equal to {0}.")
});


/**
 * Alias
 */
var translate = fun.utils.translate;
var round = fun.utils.round;