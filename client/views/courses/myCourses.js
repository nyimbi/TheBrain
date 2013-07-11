var _renderer;
Template.myCourses.course = function() {
    return Courses.find({admins: Meteor.userId()});
};

Template.myCourses.events({
    "click .courseRow": function(e) {
        console.log("this " + this._id);
        Meteor.Router.to('/course/' + this._id);
    },
    "click .btn-addCourseModal": function (e, template) {
        e.preventDefault();
        $('#newCourseModal').modal('show');
    }
});