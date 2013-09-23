; (function (jQuery, w, undefined) {
    var $ = jQuery;
    //Validation manager object
    var validationManager = function () {
        this._validators = new Object();
        this._validatorNames = [];
        this._validationResult = [];
        this._passImgae = null;
        this._failImage = null;
        this._showFailImgNotification = false;
        this._showPassImgNotification = false;
        this._showFailToolTips = false;
        this._toolTipCssClass = null;
        this._tooltipJS = new toolTipJS();
        
        //adds a failed validation to the validation results list
        this.addFailedValidation = function (validatorName, inputControl, type, message) {
            this._validationResult.push(new validatorResult(validatorName, inputControl, type, message));
        };
        ///Function to validate a particular validator
        this.v = function (validatorName) {
            var isValid = true;
            var validatorPassed = true;
            var type = null;
            var rule = null;
            var message = null;
            var inputControl = null;
            var controlValue = null;
            var validateFunc = null;
            var params = this._validators[validatorName]._params;
            var i = 0, j = 0;
            var failedCount = null;
            for (; i < params.length; i++) {
                type = params[i].type;
                rule = params[i].rule;
                message = params[i].message;
                inputControl = $("*[validatorName = '" + validatorName + "']");
                controlValue = $(inputControl).val();

                switch (type) {
                    case validationType.Required:
                        validateFunc = validateRequired;
                        break;
                    case validationType.Compare:
                        validateFunc = validateCompare;
                        break;
                    case validationType.Range:
                        validateFunc = validateRange;
                        break;
                    case validationType.RegularExpression:
                        validateFunc = validateRegExp;
                        break;
                    case validationType.Custom:
                        validateFunc = validateCustom;
                        break;
                }
                isValid = validateFunc(controlValue, rule);
                if (!isValid) {
                    validatorPassed = false;
                    this.addFailedValidation(validatorName, inputControl, type, message);
                }
            }
            return validatorPassed;
        };
        //reset notifications
        this.resetNotifications = function (validatorName) {
            var imgFail = null;
            var imgPass = null;
            var notificationControl = null;
            notificationControl = $("div[validator='" + validatorName + "']");
            if (notificationControl.length > 0) {
                if (this._showFailImgNotification === true) {
                    $("#imgFail" + validatorName).css("display", "none");
                }

                if (this._showPassImgNotification === true) {
                    $("#imgPass" + validatorName).css("display", "none");
                }               
                
                this._validators[validatorName]._isNotified = false;
            }
        };
        //Function to show notifications for validation fails
        this.notifyFail = function (validatorName) {
            var notificationControl = null;
            var sourceControl = null;
            var top = null, left = null;

            notificationControl = $("div[validator='" + validatorName + "']");
            sourceControl = $("*[validatorName='" + validatorName + "']");
            top = sourceControl.offset().top;
            left = sourceControl.offset().left + sourceControl.outerWidth();
            //we will check for each notification type and will apply them
            if (notificationControl.length > 0 && sourceControl.length > 0) {
                $("#imgFail" + validatorName).css("display", "inline");
                notificationControl.css("top", top);
                notificationControl.css("left", left);
            }
        };
        //Function to show notifications for validation passes
        this.notifyPass = function (validatorName) {
            var notificationControl = null;
            var sourceControl = null;
            var top = null, left = null;

            notificationControl = $("div[validator='" + validatorName + "']");
            sourceControl = $("*[validatorName='" + validatorName + "']");
            top = sourceControl.offset().top;
            left = sourceControl.offset().left + sourceControl.outerWidth();
            //we will check for each notification type and will apply them
            if (notificationControl.length > 0 && sourceControl.length > 0) {
                $("#imgPass" + validatorName).css("display", "inline");
                notificationControl.css("top", top);
                notificationControl.css("left", left);
            }
        };
        //function to reset tooltips
        this.resetToolTip = function (validatorName) {
            var control = $("div[validator='" + validatorName + "']");
            if (control.length > 0) {
                $(control).unbind("mouseover");
                $(control).unbind("mouseout");
                $(control).unbind("mousemove");
            }
        };
        //Function to apply popup tootip
        this.applyTooltip = function (validatorName) {
            var msgList = [];
            var control = null;
            var top = null;
            var left = null;
            var divToolTip = null;
            var content = "";
            var i = 0;
            control = $("div[validator='" + validatorName + "']");
            if (control.length > 0) {
                for (; i < this._validationResult.length; i++) {
                    if (this._validationResult[i].validatorName === validatorName) {
                        msgList.push(this._validationResult[i].message);
                    }
                }

                i = 0;
                //lets build our tooltip content
                for (; i < msgList.length; i++) {
                    content += "# " + msgList[i] + "<br/>";
                }

                this._tooltipJS.applyTooltip(control, content, 5, true);
            }
        };
        //reposition notification image div on window resize
        this.repositionNotifications = function () {
            var notificationControl = null, sourceControl = null;;
            var validatorName = null;
            var validators = this._validatorNames;
            var top = null, left = null;
            var i = 0;

            for (; i < validators.length; i++) {
                validatorName = this._validators[validators[i]]._name;
                notificationControl = $("div[validator='" + validatorName + "']");
                sourceControl = $("*[validatorName='" + validatorName + "']");
                if (notificationControl.length > 0 && sourceControl.length > 0) {
                    top = sourceControl.offset().top;
                    left = sourceControl.offset().left + sourceControl.outerWidth();
                    notificationControl.css("top", top);
                    notificationControl.css("left", left);
                }                
            }
        };
        return this;
    };
    validationManager.prototype = {
        initialize: function () {
            var notificationControl = null;
            var imgFail = null, imgPass = null;
            var validatorName = null;
            var validators = this._validatorNames;
            var resizeEventDelegate = $.proxy(this.repositionNotifications, this);
            var i = 0;

            $(w).resize(resizeEventDelegate);

            //lets preload the fail and pass images for all validators
            //if applicable

            //Fail Image
            if (this._showFailImgNotification === true) {
                for (; i < validators.length; i++) {
                    validatorName = this._validators[validators[i]]._name;
                    notificationControl = $("div[validator='" + validatorName + "']");
                    if (notificationControl.length > 0) {
                        imgFail = $("#imgPass" + validatorName);
                        if (!(imgFail.length > 0)) {
                            imgFail = document.createElement("img");
                            imgFail.setAttribute("id", "imgFail" + validatorName);
                            notificationControl.append(imgFail);
                            imgFail = $("#imgFail" + validatorName);                                                  
                        }
                        imgFail.css("display", "none");
                        imgFail.css("position", "absolute");
                        imgFail.attr("src", this._failImage);
                        notificationControl.css("position", "absolute");
                    }
                }
            }
            //Pass Image
            i = 0;
            if (this._showPassImgNotification === true) {
                for (; i < validators.length; i++) {
                    validatorName = this._validators[validators[i]]._name;
                    notificationControl = $("div[validator='" + validatorName + "']");
                    if (notificationControl.length > 0) {
                        imgPass = $("#imgPass" + validatorName);
                        if (!(imgPass.length > 0)) {
                            imgPass = document.createElement("img");
                            imgPass.setAttribute("id", "imgPass" + validatorName);
                            notificationControl.append(imgPass);
                            imgPass = $("#imgPass" + validatorName);
                        }
                        imgPass.css("display", "none");
                        imgPass.css("position", "absolute");
                        imgPass.attr("src", this._passImage);
                        notificationControl.css("position", "absolute");
                    }
                }
            }
            return this;
        },
        applyToolTipCss: function (className) {
            this._toolTipCssClass = className;
            this._tooltipJS.className = className;
            return this;
        },        
        showFailToolTips: function (bool) {
            this._showFailToolTips = bool;
            return this;
        },
        showFailImgNotification: function(bool){
            this._showFailImgNotification = bool;
            return this;
        },
        showPassImgNotification: function (bool) {
            this._showPassImgNotification = bool;
            return this;
        },
        setPassImage: function (img) {
            this._passImage = img;
            return this;
        },
        setFailImage: function(img){
            this._failImage = img;
            return this;
        },
        getValidationResults: function () {
            return this._validationResult;
        },
        validate: function (validatorList) {
            var isValid = true;
            var validatorName = null;
            var validatorPassed = true;
            this._validationResult = [];
            var i = 0;
            for (; i < validatorList.length; i++) {
                validatorName = validatorList[i];
                //first reset all the notifications and tooltips for this validator
                this.resetNotifications(validatorName);
                this.resetToolTip(validatorName);

                //validate each validator individually
                validatorPassed = this.v(validatorName);

                //show pass or fail notifications
                if (!validatorPassed) {
                    if (this._showFailImgNotification == true) {
                        this.notifyFail(validatorName);
                    }
                    
                    if (this._showFailToolTips === true) {
                        this.applyTooltip(validatorName);
                    }                    
                }
                else {
                    if (this._showPassImgNotification == true) {
                        this.notifyPass(validatorName);
                    }                   
                }
            }
            if (this._validationResult.length > 0) { //we have a failed validation
                isValid = false;
            }
            return isValid;
        },
        validateAll: function () {
            var i = 0;
            for (; i < this._validators.length; i++) {
                this.v(_validators[i]._name);
            }
            return this;
        },
        addValidator: function (validators, params) {
            var i = 0;
            for (; i < validators.length; i++) {
                this._validators[validators[i]] = new validator(validators[i], params);
                this._validatorNames.push(validators[i]);
            }
            return this;
        },
        removeValidator: function (validatorName) {
            //not implemented
        }
    };

    //validation functions
    function validateRequired(controlValue) {
        if (controlValue === null
            || controlValue === undefined
            || controlValue === "") {
            return false;
        }
        else {
            return true;
        }
    }
    //function to check compare field validators
    function validateCompare(controlValue, rule) {
        var type = rule.compareType;
        var value = rule.value;
        switch (type) {
            case compareType.Equal:
                if (!(controlValue === value)) { return false; }
                break;
            case compareType.NotEqual:
                if (!(controlValue !== value)) { return false; }
                break;
            case compareType.GreaterThan:
                if (!(controlValue > value)) { return false; }
                break;
            case compareType.GreaterThanEqual:
                if (!(controlValue >= value)) { return false; }
                break;
            case compareType.LessThan:
                if (!(controlValue < value)) { return false; }
                break;
            case compareType.LessThanEqual:
                if (!(controlValue <= value)) { return false; }
                break;
        }
        return true;
    }
    //function to validate range validators
    function validateRange(controlValue, rule) {
        var minValue = rule[0];
        var maxValue = rule[1];
        if (!(controlValue >= minValue && controlValue <= maxValue)) { return false }
        return true;
    }
    //function to validate regular expression validators
    function validateRegExp(controlValue, rule) {
        var regExp = new RegExp(rule);
        return regExp.test(controlValue);
    }
    //function to validate custom validators
    function validateCustom(controlValue, rule) {
        var functionToCall = rule;
        return functionToCall(controlValue);
    }
    //validator object
    var validator = function (name, params) {
        this._name = name;
        this._params = params;
        this._isNotified = false;
    };
    //validationResult object
    var validatorResult = function (validatorName, sourceControl, type, message) {
        this.validatorName = validatorName;
        this.sourceControl = sourceControl;
        this.type = type;
        this.message = message;
    };	
    //Validation Types
    var validationType = {
        Required: 1,
        Compare: 2,
        Range: 3,
        RegularExpression: 4,
        Custom: 5
    };
    //Compare Types
    var compareType = {
        Equal: 1,
        NotEqual: 2,
        GreaterThan: 3,
        GreaterThanEqual: 4,
        LessThan: 5,
        LessThanEqual: 6
    };

    //TooltipJS Library
    //https://github.com/Nitij/JavascriptTooltip

    var toolTipJS = function () {
        //***Summary***
        //Flag to check if the mouse pointer is inside the source element
        //*************
        this.inside = false;

        //***Summary***
        //Css class for Tooltip
        //*************
        this.className = "";

        //***Summary***
        //applies the tooltip show and hide functions on the mouseover and
        //mouseout events of the source control
        //***Params****
        //sourceControlId = ID of source control.
        //content = Tooltip content.
        //distance = Distance between the tooltip and the source control.
        //*************
        this.applyTooltip = function (sourceControl, content, distance, showAtPointer) {
            var divToolTip = null;
            var showTooltipDelegate = null;
            var hideTooltipDelegate = null;
            //var sourceControl = $("#" + sourceControlId);
            var params = null;
            divToolTip = $("#divToolTip");

            //create our tooltip div if not already present
            if (!(divToolTip.length > 0)) {
                divToolTip = document.createElement("div");
                divToolTip.setAttribute("id", "divToolTip");
                $("body").append(divToolTip);
                divToolTip = $("#divToolTip");
                divToolTip.css("position", "absolute");
                divToolTip.css("display", "none");
            }

            //delegate to change the calling context to our toolTipJS object
            showTooltipDelegate = $.proxy(showToolTip, this);
            hideTooltipDelegate = $.proxy(hideTooltip, this);
            params = {
                "sourceControl": sourceControl,
                "content": content,
                "distance": distance,
                "showAtPointer": showAtPointer
            }

            if (showAtPointer === false) {
                sourceControl.mouseover(params, showTooltipDelegate);
            }
            else {
                sourceControl.mousemove(params, showTooltipDelegate);
            }

            sourceControl.mouseout(hideTooltipDelegate);
        };
    };

    //***Summary***
    //show the tooltip after computing the position and the correct style to apply on
    //the tooltip div.
    //*************
    function showToolTip(e) {
        var i = 0;
        var showAtPointer = e.data.showAtPointer;
        var sourceControl = e.data.sourceControl;
        var content = e.data.content;
        var targetLeft = null, targetTop = null; //top and left of the tooltip div
        var top = sourceControl.offset().top;
        var left = sourceControl.offset().left;
        var right = sourceControl.offset().left + sourceControl.outerWidth();
        var bottom = sourceControl.offset().top + sourceControl.outerHeight();
        var divToolTip = $("#divToolTip");
        var distance = e.data.distance;

        if (showAtPointer === true) {
            left = right = e.pageX;
            top = bottom = e.pageY;
        }

        divToolTip.removeClass(); //remove any previous class
        //reset top and left
        if (this.inside === false) {
            divToolTip.css("top", 0);
            divToolTip.css("left", 0);
        }
        divToolTip.html(content); //set the tooltip content
        
        //show the tooltip at the top right
        divToolTip.addClass(this.className);
        targetLeft = right + distance;
        targetTop = top;
                                
        //apply the top and left for the tooltip div
        divToolTip.css("top", targetTop);
        divToolTip.css("left", targetLeft);
        if (this.inside === false) {
            divToolTip.css("display", "block");
            this.inside = true;
        }
    }

    //***Summary***
    //hides the toooltip div.
    //*************
    function hideTooltip() {
        this.inside = false;
        $("#divToolTip").css("display", "none");
    };
    //we only need this tooltip library for internal validation use
    //w["ToolTipJS"] = toolTipJS;

    //------------------------------------------

    w["ValidationManager"] = validationManager;
    w["ValidationType"] = validationType;
    w["CompareType"] = compareType;
})($, window);