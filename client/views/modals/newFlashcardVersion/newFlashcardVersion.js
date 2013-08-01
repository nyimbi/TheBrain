Template.updatedFlashcardVersions.flashcardVersion = function () {
    var _item = Items.findOne({_id: Session.get("currentItemId")});
    var _flashcard = Flashcards.findOne({_id: Session.get("currentFlashcardId")});
    if (_item && _flashcard && _item.flashcardVersionSeen < _flashcard.version) {
    var _updatedVersions = [];
    if (_flashcard) {
        var _updatedVersions = $.grep(_flashcard.previousVersions, function (previousVersion) {
            return previousVersion.version > _item.flashcardVersionSeen;
        });

        var _newestVersion = {
            front: _flashcard.front,
            frontPicture: _flashcard.frontPicture,
            back: _flashcard.back,
            backPicture: _flashcard.backPicture,
            version: _flashcard.version,
            reason: _flashcard.reason,
            upVotes: _flashcard.upVotes.length,
            downVotes: _flashcard.downVotes.length
        }
        _updatedVersions.push(_newestVersion);

        _updatedVersions.sort(function (a, b) {
            if (a.version < b.version) {
                return 1;
            } else if (a.version > b.version) {
                return -1;
            }
            return 0;
        })

        return _updatedVersions;
    }
    }
}

Template.updatedFlashcardVersions.currentItem = function () {
    var _item = Items.findOne({_id: Session.get("currentItemId")});
    if (_item) {
        return _item;
    }
}

Template.updatedFlashcardVersions.currentItemFront = function () {
    var front = this.personalFront;


    if (this.frontNote) {
        front = front + "<br/><span class='note'>" + this.frontNote + "</span>";
    }


    var _frontPicture;
    if (this.personalFrontPicture) {
        _frontPicture = this.personalFrontPicture;
    }


    if (_frontPicture) {
        console.log("in front before ", front);
        front = '<a id="test2" href="' + _frontPicture + '" class="flashcardPicture pull-right slimboxPicture" title="' + front + '"> \
        <img src="' + _frontPicture + '/convert?h=80&w=80" class="editableImage"/></a> \
        <div name="front" class="flashcardFront">' + front + '</div>';
        console.log("front after", front);
    }

    return front;
}

Template.updatedFlashcardVersions.currentItemBack = function () {
    var back = this.personalBack;

    if (this.backNote) {
        back = back + "<br/><span class='note'>" + this.backNote + "</span>";
    }

    var _backPicture;
    if (this.personalBackPicture) {
        _backPicture = this.personalBackPicture;
    }

    if (_backPicture) {
        back = '<a id="test1" href="' + _backPicture + '" class="flashcardPicture pull-right slimboxPicture" title="' + back + '"> \
        <img src="' + _backPicture + '/convert?h=80&w=80" class="editableImage"/></a> \
        <div name="back" class="flashcardBack">' + back + '</div>';
    }

    return back;
}
Template.updatedFlashcardVersions.flashcardFront = function () {
//    var this = Items.findOne({_id: Session.get("currentItemId")});
    var front = stripHtml(this.front);


    var _frontPicture

    if (this.frontPicture) {
        _frontPicture = this.frontPicture;
    }


    if (_frontPicture) {
        front = '<a href="' + _frontPicture + '" class="flashcardPicture pull-right slimboxPicture" title="' + front + '"> \
        <img src="' + _frontPicture + '/convert?h=80&w=80" class="editableImage"/></a> \
        <div name="front" class="flashcardFront">' + front + '</div>';
        console.log("front after", front);
    }


    return front;

}


Template.updatedFlashcardVersions.flashcardBack = function () {
    var back = stripHtml(this.back);
    var _backPicture;

    if (this.backPicture) {
        _backPicture = this.backPicture;
    }

    if (_backPicture) {
        back = '<a href="' + _backPicture + '" class="flashcardPicture pull-right slimboxPicture" title="' + back + '"> \
        <img src="' + _backPicture + '/convert?h=80&w=80" class="editableImage"/></a> \
        <div name="back" class="flashcardBack">' + back + '</div>';
    }

    return back;


}