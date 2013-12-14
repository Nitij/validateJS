; (function ($, w, undefined) {
    //Validation manager object
    var validationManager = function () {
        this._validators = new Object();
        this._validatorNames = [];
        this._passImage = "./validateJSImages/Passed/check-icon24pixel.png";
        this._failImage = "./validateJSImages/Failed/delete-icon24pixel.png";
        this._showFailImgNotification = true;
        this._showPassImgNotification = true;
        this._highlightBackground = false;
        this._showFailToolTips = true;
        this._toolTipCssClass = null;
        this._validateOnTextChange = null;
        this._tooltipJS = new toolTipJS();
        this._tooltipContentTemplate = "";
        this._tooltipMessageTemplate = "";
        return this;
    };
    validationManager.prototype = {
        //clear all the current validators and their rules.
        clearValidators: function () {
            this._validators = new Object();
            this._validatorNames = [];
            return this;
        },
        customInitialize: function (validatorName) {
            //lets preload the fail and pass images for all validators
            //if applicable
            //Fail Image
            if (this._showFailImgNotification === true) {
                addFailImageControl(this._validators[validatorName], this._failImage);
            }
            //Pass Image
            if (this._showPassImgNotification === true) {
                addPassImageControl(this._validators[validatorName], this._passImage);
            }
        },
        initialize: function () {
            var notificationControl = null,
                imgFail = null, imgPass = null,
                validatorName = null,
                validators = this._validatorNames,
                toolTipCssClass = [], tooltipTriangle = "",
                toolTipLeftTriangle = "", toolTipRightTriangle = "",
                backgroundHighlightCss = ".validateJSHighlightBackground {background-color:#FFE4E1;}",
                i = 0,
                changeEventDelegate = null; //reusable delegate

            //reset tooltip content and message template in case of reinitialization
            this._tooltipContentTemplate = "";
            this._tooltipMessageTemplate = "";
            //lets preload the fail and pass images for all validators
            //if applicable
            //Fail Image
            if (this._showFailImgNotification === true) {
                for (; i < validators.length; i++) {
                    addFailImageControl(this._validators[validators[i]], this._failImage);
                }
            }
            //Pass Image
            i = 0;
            if (this._showPassImgNotification === true) {
                for (; i < validators.length; i++) {
                    addPassImageControl(this._validators[validators[i]], this._passImage);
                }
            }
            //validate on change event if validateOnTextChange is true
            i = 0;
            if (this._validateOnTextChange && this._validateOnTextChange.value) {
                for (; i < validators.length; i++) {
                    validatorName = this._validators[validators[i]]._name;
                    inputControl = $("*[validatorName = '" + validatorName + "']");
                    changeEventDelegate = $.proxy(this.validate, this);
                    inputControl.change({ validatorList: [validatorName] }, changeEventDelegate);
                }
            }

            //Initialize tooltip content template
            this._toolTipCssClass = "validateJSToolTip";
            this._tooltipJS.className = "validateJSToolTip";

            this._tooltipContentTemplate += "<table style='text-align:left;font-family:Arial;'>";
            this._tooltipContentTemplate += "<tr><th colspan='2'style='background-color:#C6E2FF;text-align:center;'>Messages</th></tr>";
            this._tooltipContentTemplate += "{{validation-messages}}";
            this._tooltipContentTemplate += "</table>";
            this._tooltipMessageTemplate += "<tr><td style='padding:1px;'>&#8226;</td><td style='padding:1px;'><span style='font-weight:900;'>";
            this._tooltipMessageTemplate += "</span> {{message}}</td></tr>";

            //we need to add the css class for our validation tooltips
            //to the end of the <head> tag
            //Tooltip css class
            toolTipCssClass.push(".validateJSToolTip{ background-color:#ffffff;");
            toolTipCssClass.push("font-size:medium;font-weight:400;padding:7px;");
            toolTipCssClass.push("border: 2px solid #000000;-moz-border-radius: 16px;");
            toolTipCssClass.push("-webkit-border-radius: 16px;border-radius: 16px;}");
            toolTipCssClass = toolTipCssClass.join('');

            //tooltip triangle
            tooltipTriangle += ".{{class-name}}{position: absolute;";
            tooltipTriangle += "border-style:solid;border-width: 8px 8px 8px 8px;";
            tooltipTriangle += "border-color:{{border-color}};";
            tooltipTriangle += "height:0px;width: 0px;}";

            //Tooltip left triangle css class
            toolTipLeftTriangle = tooltipTriangle.replace("{{border-color}}",
                "transparent #000000 transparent transparent");
            toolTipLeftTriangle = toolTipLeftTriangle.replace("{{class-name}}",
                "validateJSTooltipLeft");

            //Tooltip left triangle css class
            toolTipRightTriangle = tooltipTriangle.replace("{{border-color}}",
                "transparent transparent transparent #000000");
            toolTipRightTriangle = toolTipRightTriangle.replace("{{class-name}}",
                "validateJSTooltipRight");

            $("<style type='text/css'>" + toolTipCssClass + " " + toolTipLeftTriangle
                + " " + toolTipRightTriangle + backgroundHighlightCss + "</style>").appendTo("head");

            return this;
        },
        showFailToolTips: function (bool) {
            this._showFailToolTips = bool;
            return this;
        },
        showFailImgNotification: function (bool) {
            this._showFailImgNotification = bool;
            return this;
        },
        showPassImgNotification: function (bool) {
            this._showPassImgNotification = bool;
            return this;
        },
        highlightBackground: function (bool) {
            this._highlightBackground = bool;
            return this;
        },
        setPassImage: function (img) {
            this._passImage = img;
            return this;
        },
        setFailImage: function (img) {
            this._failImage = img;
            return this;
        },
        getValidationResults: function (validator) {
            var results = [],
                validators = this._validatorNames,
                i = 0;
            if (isNullOrUndefined(validator)) {
                for (; i < validators.length; i++) {
                    $.merge(results, this._validators[validators[i]]._failedMessages);
                }
            }
            else {
                results = this._validators[validator]._failedMessages;
            }
            return results;
        },
        validate: function (validatorList) {
            var isValid = true,
                validatorName = null,
                validatorPassed = true,
                i = 0;

            if (validatorList.type && validatorList.type === "change") {
                validatorList = validatorList.data.validatorList;
            }

            for (; i < validatorList.length; i++) {
                validatorName = validatorList[i];
                //first reset all the notifications and tooltips for this validator
                resetNotifications(validatorName, this);
                resetToolTip(validatorName);

                //validate each validator individually
                validatorPassed = v(validatorName, this);

                //show pass or fail notifications
                if (!validatorPassed) {
                    if (this._showFailImgNotification == true) {
                        notifyFail(validatorName);
                    }

                    if (this._showFailToolTips === true) {
                        applyTooltip(validatorName, this);
                    }

                    if (this._highlightBackground === true) {
                        notifyBackgroundHighlight(validatorName);
                    }
                }
                else {
                    if (this._showPassImgNotification == true) {
                        notifyPass(validatorName);
                    }
                }
                if (isValid && this._validators[validatorName]._failedMessages.length > 0) { //we have a failed validation
                    isValid = false;
                }
            }
            if (this._validateOnTextChange
                && this._validateOnTextChange.value
                && !isNullOrUndefined(this._validateOnTextChange.onComplete)) {
                this._validateOnTextChange.onComplete(validatorList);
            };
            return isValid;
        },
        validateAll: function () {
            var i = 0,
                isValid = true,
                valid = true,
                validatorNames = this._validatorNames;
            for (; i < validatorNames.length; i++) {
                valid = this.validate(validatorNames);
                if (!valid)
                    isValid = false;
            }
            return isValid;
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
        },
        validateOnTextChange: function (f, onComplete) {
            this._validateOnTextChange = { value: f, onComplete: onComplete };
            return this;
        },
        isValid: function (validatorList) { 
            var results = [],
                validators = this._validatorNames,
                i = 0;
            if (isNullOrUndefined(validatorList) || validatorList.length == 0) {
                for (; i < validators.length; i++) {
                    $.merge(results, this._validators[validators[i]]._failedMessages);
                }
            }
            else {
                for (; i < validatorList.length; i++) {
                    $.merge(results, this._validators[validatorList[i]]._failedMessages);
                }
            }
            return !(results.length > 0);
        }
    };

    //adds pass image control for a particular validator
    function addPassImageControl(validator, passImage) {
        var notificationControl = null,
            imgPass = null,
            validatorName = null;

        validatorName = validator._name;
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
            imgPass.attr("src", passImage);
            notificationControl.css("display", "inline");
        }
    }

    //adds failed image control for a particular validator
    function addFailImageControl(validator, failImage) {
        var notificationControl = null,
            imgFail = null,
            validatorName = null;
        validatorName = validator._name;
        notificationControl = $("div[validator='" + validatorName + "']");
        if (notificationControl.length > 0) {
            imgFail = $("#imgFail" + validatorName);
            if (!(imgFail.length > 0)) {
                imgFail = document.createElement("img");
                imgFail.setAttribute("id", "imgFail" + validatorName);
                notificationControl.append(imgFail);
                imgFail = $("#imgFail" + validatorName);
            }
            imgFail.css("display", "none");
            imgFail.css("position", "absolute");
            imgFail.attr("src", failImage);
            notificationControl.css("display", "inline");
        }
    }

    //adds a failed validation to the validation results list
    function addFailedValidation(validatorName, inputControl, type, message, vManager) {
        vManager._validators[validatorName]._failedMessages
            .push(new validatorResult(validatorName, inputControl, type, message));
    }

    //reset notifications
    function resetNotifications(validatorName, vManager) {
        var imgFail = null,
            imgPass = null,
            notificationControl = null,
            sourceControl = null;
        sourceControl = $("*[validatorName='" + validatorName + "']");
        notificationControl = $("div[validator='" + validatorName + "']");
        if (notificationControl.length > 0) {
            $("#imgFail" + validatorName).css("display", "none");
            $("#imgPass" + validatorName).css("display", "none");
            vManager._validators[validatorName]._isNotified = false;
        }
        if (vManager._highlightBackground === true && sourceControl.length > 0) {
            sourceControl.removeClass();
        }
    }

    //Function to apply popup tootip
    function applyTooltip(validatorName, vManager) {
        var msgList = vManager._validators[validatorName]._failedMessages,
            control = null,
            divToolTip = null,
            messageBody = [],
            tooltipContent = vManager._tooltipContentTemplate,
            msgTemplate = vManager._tooltipMessageTemplate,
            i = 0;

        control = $("div[validator='" + validatorName + "']");
        if (control.length > 0) {
            i = 0;
            //lets build our tooltip content
            debugger;
            for (; i < msgList.length; i++) {
                messageBody.push(msgTemplate.replace("{{message}}", msgList[i].message));
            }
            messageBody = messageBody.join('');
            tooltipContent = tooltipContent.replace("{{validation-messages}}", messageBody);

            vManager._tooltipJS.applyTooltip(control, tooltipContent, 14, false);
        }
    }

    ///Function to validate a particular validator
    function v(validatorName, vManager) {
        var isValid = true,
            validatorPassed = true,
            type = null,
            rule = null,
            message = null,
            inputControl = null,
            controlValue = null,
            validateFunc = null,
            params = vManager._validators[validatorName]._params,
            i = 0, j = 0,
            failedCount = null;

        //lets first clear the current failed validation messages
        vManager._validators[validatorName]._failedMessages = [];
        for (; i < params.length; i++) {
            type = params[i].type;
            rule = params[i].rule;
            message = params[i].message;
            inputControl = $("*[validatorName = '" + validatorName + "']");
            //check if input control is checkbox or not
            if (inputControl.is(':checkbox'))
                controlValue = inputControl.prop('checked') //if checkbox then set value to true/false
            else
                controlValue = inputControl.val();
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
                case validationType.MinLength:
                    validateFunc = validateMinLength;
                    break;
                case validationType.MaxLength:
                    validateFunc = validateMaxLength;
                    break;
                case validationType.Alphabets:
                    validateFunc = validateAlphabets;
                    break;
                case validationType.AlphaNumeric:
                    validateFunc = validateAlphaNumeric;
                    break;
                case validationType.Numeric:
                    validateFunc = validateNumeric;
                    break;
            }

            isValid = validateFunc(controlValue, rule);
            if (!isValid) {
                validatorPassed = false;
                addFailedValidation(validatorName, inputControl, type, message, vManager);
            }
        }
        return validatorPassed;
    }

    //Function to notify border highlighting
    function notifyBackgroundHighlight(validatorName) {
        var sourceControl = null;
        sourceControl = $("*[validatorName='" + validatorName + "']");
        //we will check for each notification type and will apply them
        if (sourceControl.length > 0) {
            $(sourceControl).addClass("validateJSHighlightBackground");
        }
    };

    //function to reset tooltips
    function resetToolTip(validatorName) {
        var control = $("div[validator='" + validatorName + "']");
        if (control.length > 0) {
            $(control).unbind("mouseover");
            $(control).unbind("mouseout");
            $(control).unbind("mousemove");
        }
    }

    //Function to show notifications for validation fails
    function notifyFail(validatorName) {
        var notificationControl = null,
            sourceControl = null;
        notificationControl = $("div[validator='" + validatorName + "']");
        sourceControl = $("*[validatorName='" + validatorName + "']");
        //we will check for each notification type and will apply them
        if (notificationControl.length > 0 && sourceControl.length > 0) {
            $("#imgFail" + validatorName).css("display", "inline");
        }
    }

    //Function to show notifications for validation passes
    function notifyPass(validatorName) {
        var notificationControl = null,
            sourceControl = null;

        notificationControl = $("div[validator='" + validatorName + "']");
        sourceControl = $("*[validatorName='" + validatorName + "']");
        //we will check for each notification type and will apply them
        if (notificationControl.length > 0 && sourceControl.length > 0) {
            $("#imgPass" + validatorName).css("display", "inline");
        }
    }

    //retruns true if the value is null or undefined
    function isNullOrUndefined(value) {
        return (value === null || value == undefined);
    }

    //validation functions
    function validateRequired(controlValue) {
        if (controlValue === true) //for checkbox
            return true;
        else if (controlValue === false) //for checkbox
            return false
        else if (controlValue === null
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
        var type = rule.compareType,
            value = rule.value;
        if (controlValue.length === 0 || !isNumber(controlValue)) { return false; }
        if (controlValue.length > 0) {
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
        }
        return true;
    }
    //function to validate range validators
    function validateRange(controlValue, rule) {
        var minValue = rule[0];
        var maxValue = rule[1];
        if (controlValue.length === 0 || !isNumber(controlValue)) { return false; }
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
    //function to check min length
    function validateMinLength(controlValue, rule) {
        var minLength = rule[0];
        if (controlValue.length < minLength) { return false; }
        else { return true; }
    }
    //function to check max length
    function validateMaxLength(controlValue, rule) {
        var maxLength = rule[0];
        if (controlValue.length > maxLength) { return false; }
        else { return true; }
    }
    //function to validate alphabets
    function validateAlphabets(controlValue) {
        var regExp = new RegExp("^[a-zA-Z ]*$");
        return regExp.test(controlValue);
    }
    //function to validate alpha numeric values
    function validateAlphaNumeric(controlValue) {
        var regExp = new RegExp("^[a-zA-Z0-9_]*$");
        return regExp.test(controlValue);
    }
    //function to validate numeric values
    function validateNumeric(controlValue) {
        var regExp = new RegExp("^[0-9]+$");
        return regExp.test(controlValue);
    }
    //validator object
    var validator = function (name, params) {
        this._name = name;
        this._params = params;
        this._isNotified = false;
        this._failedMessages = [];
    };
    //validationResult object
    var validatorResult = function (validatorName, sourceControl, type, message) {
        this.validatorName = validatorName;
        this.sourceControl = sourceControl;
        this.type = type;
        this.message = message;
    };

    //function to check if a given value is numeric or not
    function isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    //Validation Types
    var validationType = {
        Required: 1,
        Compare: 2,
        Range: 3,
        RegularExpression: 4,
        Custom: 5,
        MinLength: 6,
        MaxLength: 7,
        Alphabets: 8,
        AlphaNumeric: 9,
        Numeric: 10
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
            divToolTip = null, divToolTipTriangle = null,
                showTooltipDelegate = null,
                hideTooltipDelegate = null;
            //var sourceControl = $("#" + sourceControlId);
            var params = null;
            divToolTip = $("#divToolTip");
            divToolTipTriangle = $("#divToolTipTriangle");

            //create our tooltip div if not already present
            if (!(divToolTip.length > 0)) {
                //add divToolTip
                divToolTip = document.createElement("div");
                divToolTip.setAttribute("id", "divToolTip");
                $("body").append(divToolTip);
                divToolTip = $("#divToolTip");
                divToolTip.css("position", "absolute");
                divToolTip.css("display", "none");
                divToolTip.css("max-width", "250px");

                //add divToolTip arrow
                divToolTipTriangle = document.createElement("div");
                divToolTipTriangle.setAttribute("id", "divToolTipTriangle");
                $("body").append(divToolTipTriangle);
                divToolTipTriangle = $("#divToolTipTriangle");
                divToolTipTriangle.css("position", "absolute");
                divToolTipTriangle.css("display", "none");
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
        var i = 0,
            showAtPointer = e.data.showAtPointer,
            sourceControl = e.data.sourceControl,
            content = e.data.content,
            divToolTip = $("#divToolTip"),
            divToolTipTriangle = $("#divToolTipTriangle"),
            targetLeft = null, targetTop = null, //top and left of the tooltip div
            tooltipHeight = null, tooltipWidth = null,
            srcWidth = sourceControl[0].firstChild.clientWidth,
            srcHeight = sourceControl[0].firstChild.clientHeight,
            top = sourceControl.offset().top,
            left = sourceControl.offset().left,
            right = sourceControl.offset().left + srcWidth,
            bottom = sourceControl.offset().top + srcHeight,
            distance = e.data.distance;

        //remove any previous class
        divToolTip.removeClass();
        divToolTipTriangle.removeClass();

        //reset top and left
        if (this.inside === false) {
            divToolTip.css("top", 0);
            divToolTip.css("left", 0);
        }
        divToolTip.html(content); //set the tooltip content
        //set the tooltip class
        divToolTip.addClass(this.className);
        tooltipHeight = divToolTip.outerHeight();
        tooltipWidth = divToolTip.outerWidth();
        if (showAtPointer === true) {
            left = right = e.pageX;
            top = bottom = e.pageY;
        }
        else {
            targetTop = (top + (srcHeight / 2)) - (tooltipHeight / 2);
            targetTop -= 4; //adjusting top
            if (($(window).width() - right) > 250) { //right position for tooltip
                targetLeft = right + distance;
                divToolTipTriangle.addClass("validateJSTooltipLeft");
                divToolTipTriangle.css("left", right - 1);
            }
            else { //else left position for tooltip
                targetLeft = left - divToolTip.outerWidth() - distance;
                divToolTipTriangle.addClass("validateJSTooltipRight");
                divToolTipTriangle.css("left", left - 15);
            }
            divToolTipTriangle.css("top", (targetTop + (tooltipHeight / 2)) - 8);
        }

        //apply the top and left for the tooltip div
        divToolTip.css("top", targetTop);
        divToolTip.css("left", targetLeft);
        if (this.inside === false) {
            divToolTip.css("display", "block");
            divToolTipTriangle.css("display", "block");
            this.inside = true;
        }
    }

    //***Summary***
    //hides the toooltip div.
    //*************
    function hideTooltip() {
        this.inside = false;
        $("#divToolTip").css("display", "none");
        $("#divToolTipTriangle").css("display", "none");
    };

    w["ValidationManager"] = validationManager;
    w["ValidationType"] = validationType;
    w["CompareType"] = compareType;
})($, window);