define(function () {
    function modelBase(title) {
        this.title = title;
    }

    modelBase.prototype = {
        getTitle: function () {
            return this.title;
        }
    };

    return modelBase;
});
