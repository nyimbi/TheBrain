var currentFlashcard, currentItemId, itemsToLearn = [], _renderer, _renderer2;

Meteor.subscribe("myItems");
//Meteor.subscribe("currentFlashcard");

Deps.autorun(function () {
    console.log("deps currentFlashcard " + Session.get("currentFlashcardId"));
    if (Session.get("currentFlashcardId")) {
        Meteor.subscribe("currentFlashcard", Session.get("currentFlashcardId"));
    }
});
//
//function getNextItem() {
//    currentItem = Items.findOne();
//    if (currentItem) {
//        Session.set("currentFlashcard", currentItem.flashcard);
//    }
//}

function returnNextItem() {
    // Najpierw powtorki
    var _now = moment().hours(0).minutes(0).seconds(0).milliseconds(0)._d;
    var _nextItem = null;

    // Repetition first
    if (Items.find({nextRepetition: {$lte: _now}, actualTimesRepeated: {$gt: 0}}).count() > 0) {
        _nextItem = Items.findOne({nextRepetition: {$lte: _now}, actualTimesRepeated: {$gt: 0}});
        return (_nextItem) ? _nextItem._id : false;
    }


    // Items to learn
    for (var collectionId in itemsToLearn) {
        // console.log("collectionId " + collectionId);
        if (itemsToLearn.hasOwnProperty(collectionId) && itemsToLearn[collectionId] > 0) {
            // console.log("second step,, items To learn " + itemsToLearn[collectionId]);
            _currentCollectionItemsToLearn = Items.find({collection: collectionId, actualTimesRepeated: 0}).count();
            // console.log("collections count " + _currentCollectionItemsToLearn);
            // console.log("currentCollection " + collectionId);
            if (_currentCollectionItemsToLearn && _currentCollectionItemsToLearn > 0) {
                if (itemsToLearn[collectionId] > _currentCollectionItemsToLearn) {
                    itemsToLearn[collectionId] = _currentCollectionItemsToLearn;
                }
                else {
                    itemsToLearn[collectionId]--;
                }
                _nextItem = Items.findOne({collection: collectionId, actualTimesRepeated: 0});
                // console.log("Items to learn");
                return (_nextItem) ? _nextItem._id : false;
            }
            else {
                delete itemsToLearn[collectionId];
            }
        }
    }

    _nextItem = Items.findOne({extraRepeatToday: true});
    return (_nextItem) ? _nextItem._id : false;
    // Items to reLearn
}

Template.repeat.item = function () {
    return Items.findOne({_id: Session.get("currentItemId")});
}

Template.repeat.flashcard = function () {
    var _item = Items.findOne({_id: Session.get("currentItemId")});
    if (_item) {
        console.log("_item", _item);
        _flashcard = Flashcards.findOne({_id: _item.flashcard});
        console.log("_flashcard", _flashcard);
        return _flashcard;
    }
}

Template.itemHistory.previousAnswer = function () {
    var _item = Items.findOne({_id: Session.get("currentItemId")});
    if (_item) {
        return _item.previousAnswers.reverse();
    }
}

Template.itemHistory.historyDate = function () {
    return new moment(this.date).fromNow();
}

Template.itemHistory.extraRepetition = function () {
    if (this.extraRepetition === true) {
        return true;
    }
    else {
        return false;
    }
}

Template.itemHistory.historyEvaluation = function () {
    var _evaluationName = "";
    switch (this.evaluation) {
        case '0':
            _evaluationName = "Blackout";
            break;
        case '1':
            _evaluationName = "Terrible";
            break;
        case '2':
            _evaluationName = "Bad";
            break;
        case '3':
            _evaluationName = "Hardly";
            break;
        case '4':
            _evaluationName = "Good";
            break;
        case '5':
            _evaluationName = "Perfect!";
            break;
    }
    return _evaluationName;
}

Template.itemHistory.daysChangeFormat = function () {
    if (this.daysChange === 1) {
        return "1 day";
    }
    else if (this.daysChange) {
        return this.daysChange + "days"
    }
    else {
        return "error";
    }
}
//Template.repeat.itemFlashcard = function () {
//    console.log("itemFlashcard");
//    return ItemFlashcards.findOne(currentItem);
//};


Template.repeat.created = function () {

};

_firstRender = true;

Template.repeat.rendered = function () {
//

    window.clearTimeout(_renderer);
    _renderer = window.setTimeout(function () {
        Meteor.tabs.setHeight();

        if (_firstRender) {

            $(".currentFlashcard > .back").prop("disabled", true);
            $(".currentFlashcard > .front").prop("disabled", true);

            _firstRender = false;
            Session.set("itemsToRepeat", "");
            // var _itemsToLearn = {};
            // myCollections = Meteor.user().collections || [];
            // myCollections.forEach(function(collection) {
            //     _itemsToLearn[collection._id] = 99999;
            // });

            // console.log("myCollections ", myCollections);

            // Session.set("itemsToLearn", _itemsToLearn);

            // console.log("_itemsToLearn " + _itemsToLearn);
            // itemsToLearn = Session.get("itemsToLearn");

            if (Session.equals("showScheduleModal", true)) {
                console.log("Are we supposed to show the modal?");

                $("#scheduleModal").modal("show").on('hidden', function () {
                    displayNextRepetition();
                });
            }
            else {
                console.log("Or not?");
                displayNextRepetition();
            }
        }


    }, 150);
    fillTemplate();
};

Template.repeat.destroyed = function () {
    Session.set("showScheduleModal", false);
    Session.set("currentItemId", null);
    Session.set("currentFlashcardId", null);
    _firstRender = true;
}

displayNextRepetition = function () {
    _nextItem = returnNextItem();
    console.log("nextItem ", _nextItem);
    if (_nextItem) {
        currentItemId = _nextItem;
        Session.set("currentItemId", currentItemId);
        _item = Items.findOne({_id: currentItemId});
        if (_item) {
            Session.set("currentFlashcardId", _item.flashcard);
        }
        fillTemplate();
    }
    else {
        Session.set("currentItemId", null);
        Session.set("currentFlashcardId", null);
        emptyTemplate();
        $("#doneForTodayModal").modal("show").on('hidden', function () {
            Meteor.Router.to("/");
        });
        // Info that you've done all repetitions for given day.
    }
}

fillTemplate = function () {
    var _currentItem = Items.findOne({_id: Session.get("currentItemId")});
    if (_currentItem) {
        front = _currentItem.personalFront;
        back = _currentItem.personalBack;

        if (_currentItem.frontNote) {
            front = front + "<br/><span class='note'>" + _currentItem.frontNote + "</span>";
        }

        if (_currentItem.backNote) {
            back = back + "<br/><span class='note'>" + _currentItem.backNote + "</span>";
        }

        var _frontPicture, _backPicture;
        if (_currentItem.personalFrontPicture) {
            _frontPicture = _currentItem.personalFrontPicture;
        }

        if (_currentItem.personalBackPicture) {
            _backPicture = _currentItem.personalBackPicture;
        }
        if (_frontPicture) {
            console.log("in front before ", front);
            front = '<a id="test2" href="' + _frontPicture + '" class="flashcardPicture pull-right slimboxPicture" title="' + front + '"> \
        <img src="' + _frontPicture + '/convert?h=80&w=80" class="editableImage"/></a> \
        <div name="front" class="flashcardFront">' + front + '</div>';
            console.log("front after", front);
        }

        if (_backPicture) {
            back = '<a id="test1" href="' + _backPicture + '" class="flashcardPicture pull-right slimboxPicture" title="' + back + '"> \
        <img src="' + _backPicture + '/convert?h=80&w=80" class="editableImage"/></a> \
        <div name="back" class="flashcardBack">' + back + '</div>';
        }


        $(".currentFlashcard > .front").html(front);
        $(".currentFlashcard > .back").html(back);
        $(".currentFlashcard > .evaluate").attr("item-id", _currentItem._id);
// setTimeout(function() {
// $(".currentFlashcard > .answer").focus();


    }
}

emptyTemplate = function () {
    $(".currentFlashcard > .front").html("");
    $(".currentFlashcard > .answer").html("").prop("disabled", true);
    $(".currentFlashcard > .back").html("");
    $(".currentFlashcard > .answer").prop("disabled", true);
}

Template.repeat.currentFlashcard = function () {

    // Bierzemy wszystkie wybrane kolekcje. Dodajemy numer karteczek do powtorek.
    // szukamy jednej karteczki, z najwczesniejsza data kolejnego powtorzenia
    // az przejdziemy wszystkie inne od extraRepeat.

    // Pozniej bierzemy karteczki nowe, do nauki.

    // a pozniej extraRepeat

};

Template.repeat.events({

    "keyup .answer": function (e) {
        if (e.keyCode === 13 || e.keyCode === 10) {
            e.preventDefault();
            showBackAndEvaluation();
        }
    },
    "click .btn-show-answer": function (e) {
        e.preventDefault();
//        $(".btn-show-answer").removeClass("visible-phone").hide();
        showBackAndEvaluation();
    },
    "click .evaluation": function (e) {
        hideBackAndEvaluation();
        var _evaluation = $(e.target).val();
        var _itemId = $(e.target).parent().attr("item-id");
        var _item = Items.findOne(_itemId);
        setNextRepetition(_evaluation, _item);
    },
    "click a[href='#picture']": function (e) {
        $(".mainBox").switchClass("span8", "span11", 800, "easeInOutBack");
    },
    "click a[href='#repeatFlashcards']": function (e) {
        $(".mainBox").switchClass("span11", "span8", 800, "easeInOutBack");
    }
});

setNextRepetition = function (evaluation, _item) {
    if (_item) {
        var _opts = {};
        if (_item.extraRepeatToday) {
            if (evaluation >= 3) {
                _item.extraRepeatToday = false;
            }
            var _opts = {
                extraRepetition: true,
                evaluation: evaluation
            }
        }
        else {
            newParameteres = calculateItem(evaluation, _item.easinessFactor, _item.timesRepeated, _item.previousDaysChange);

            _item.nextRepetition = moment().add("days", newParameteres.daysChange).hours(0).minutes(0).seconds(0).milliseconds(0)._d;
            //_item.nextRepetition = moment().hours(0).minutes(0).seconds(0).milliseconds(0)._d;
            _item.easinessFactor = newParameteres.easinessFactor;

            if (newParameteres.resetTimesRepeated) {
                _item.extraRepeatToday = true;
                _item.timesRepeated = 0;
            }
            else {
                _item.timesRepeated++;
            }
            _item.actualTimesRepeated++;
            _item.previousDaysChange = daysChange;
            _opts = {
                extraRepetition: false,
                easinessFactor: _item.easinessFactor,
                daysChange: _item.previousDaysChange,
                evaluation: evaluation
            }

        }
        Items.update(_item._id, {$set: {
            nextRepetition: _item.nextRepetition,
            easinessFactor: _item.easinessFactor,
            extraRepeatToday: _item.extraRepeatToday,
            timesRepeated: _item.timesRepeated,
            actualTimesRepeated: _item.actualTimesRepeated,
            previousDaysChange: _item.previousDaysChange}
        }, function (err) {
            if (err) {
                console.log("err ", err);
            }
        });

        var _currentEvaluation = returnCurrentEvaluation(_opts);
        Items.update({_id: _item._id}, {$addToSet: {previousAnswers: _currentEvaluation}});
    }

}

calculateItem = function (evaluation, easinessFactor, timesRepeated, previousDaysChange) {
    resetTimesRepeated = false;
    easinessFactor = calculateEasinessFactor(evaluation, easinessFactor);
    if (evaluation < 3) {
        daysChange = 1;
        resetTimesRepeated = true;
    }
    else if (timesRepeated === 0) {
        daysChange = 1;
    }
    else if (timesRepeated === 1) {
        daysChange = 5;
    }
    else {
        daysChange = Math.round(previousDaysChange * easinessFactor);
    }
    return {
        'daysChange': daysChange,
        'easinessFactor': easinessFactor,
        'resetTimesRepeated': resetTimesRepeated
    }
};

calculateEasinessFactor = function (evaluation, easinessFactor) {
    easinessFactor = roundToTwo(easinessFactor - 0.8 + (0.28 * evaluation) - (0.02 * evaluation * evaluation));
    return (easinessFactor >= 1.3) ? easinessFactor : 1.3;
}

roundToTwo = function (value) {
    return(Math.round(value * 100) / 100);
}

var returnCurrentEvaluation = function (opts) {
    var _now = Meteor.moment.fullNow();
    var _currentEvaluation = {
        evaluation: opts.evaluation,
        date: _now,
        answer: $(".currentFlashcard > .answer").text() || "No answer provided"
    }
    if (opts.extraRepetition) {
        _currentEvaluation.extraRepetition = true;
    }
    else {
        _currentEvaluation.extraRepetition = false;
        _currentEvaluation.easinessFactor = opts.easinessFactor;
        _currentEvaluation.daysChange = opts.daysChange;
    }
    return _currentEvaluation;
}

showBackAndEvaluation = function () {
    $(".currentFlashcard > .answer").blur();
    $(".currentFlashcard > .evaluate").focus();

    $(".btn-show-answer").hide();
    $(".currentFlashcard > .back").css({"visibility": ""}).show('400', function () {
        $(".currentFlashcard > .evaluate").css({"visibility": ""}).show('400', function () {
            $(".answer").focus();
        })
    })
    var _item = Items.findOne({_id: Session.get("currentItemId")});
    if (_item) {
        var _opts = {
            flashcardId: _item.flashcard,
            itemId: _item._id
        }
        checkIfFlashcardUpdated(_opts);
    }
};

hideBackAndEvaluation = function () {
    _fDiv = $(".flashcards");
    _fDiv.animate({"left": (_fDiv.width() + 40) * -1}, 500, "easeInOutBack", function () {
            displayNextRepetition();
            $(".currentFlashcard > .answer").html("");
            $(".currentFlashcard > .evaluate").css({"visibility": "hidden"}).hide('10');
            $(".currentFlashcard > .back").css({"visibility": "hidden"}).hide('10');
            _fDiv.css({"left": (_fDiv.width() + 40)}).animate({"left": 0}, 500, "easeInOutBack");
            $(".btn-show-answer").show();
        }
    )
};


Template.myCollectionsList.rendered = function () {
    window.clearTimeout(_renderer2);
    _renderer2 = window.setTimeout(function () {
        var _sliderTimeout;
        _collectionId = "";
        $(".slider-custom").slider({value: 0}).on("slideStart",function (ev) {
            _collectionId = $(this).attr("data-id");
            itemsToLearn[_collectionId] = ev.value;
            $(".toLearn.editable[data-id='" + _collectionId + "']").editable("setValue", ev.value);
        }).on("slide", function (ev) {
                if (itemsToLearn[_collectionId] !== ev.value) {

                    $(".toLearn.editable[data-id='" + _collectionId + "']").editable("setValue", ev.value);
                    itemsToLearn[_collectionId] = ev.value;
                }
            });

//        $.fn.editable.defaults.mode = 'inline';
        $(".toLearn.editable:not(.editable-click)").editable('destroy').editable({
            anim: '100',
            mode: 'inline',
            showbuttons: false,
            success: function (response, newValue) {
                _collectionId = $(this).attr("data-id");
                $(".slider-custom[data-id='" + _collectionId + "']").slider("setValue", newValue);

                itemsToLearn[_collectionId] = newValue;
            },
            validate: function (value) {
                _value = parseFloat(value);
                var intRegex = /^\d+$/;
                if (!intRegex.test(_value)) {
                    return "Has to be decimal";
                }
            }

        })

    }, 150);
}


var checkIfFlashcardUpdated = function(opts) {
    var _item = Items.findOne(opts.itemId);
    var _flashcard = Flashcards.findOne(opts.flashcardId);

    if (_item && _flashcard && _item.flashcardVersionSeen < _flashcard.version) {
        $("#newFlashcardVersionModal").modal("show");
    }
}

