var fs = require('fs');
var p = require('path');

module.exports = {

    /**
     * [deleteAll description]
     * @type {[type]}
     */
     createFolder: function ( path ) {
         if (!fs.existsSync(path)) {
             fs.mkdirSync(path);
         }
         console.log('createFolder success');
     },

    /**
     * delete Folder
     * @param  {[type]} path [description]
     * @return {[type]}      [description]
     */
    deleteFolder: function (path) {
        var _this = this;
        var files = [];
        if( fs.existsSync(path)) {
            files = fs.readdirSync(path);
            console.log(files);
            files.forEach(function (file, index) {
                var curPath = p.join(path, file);
                if( fs.statSync(curPath).isDirectory() ) {
                    _this.deleteFolder(curPath);
                } else {
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
        console.log('deleteFolder success')
    },

    /**
     * [description]
     * @param  {[type]} path [description]
     * @return {[type]}      [description]
     */
    deleteProjectFolder: function (path) {
        var _this = this;
        var files = [];
        if(fs.existsSync(path)) {
            files = fs.readdirSync(path);
            files.forEach(function (file, index) {
                var curPath = p.join(path, file);
                if( fs.statSync(curPath).isDirectory() ) {
                    _this.deleteFolder(curPath);
                }
            });

        }
        //fs.rmdirSync(path);
        console.log('deleteProjectFolder success')
    },

    /**
     * delete File
     * @param  {[type]} path [description]
     * @return {[type]}      [description]
     */
    deleteFile: function( path ) {
        if ( fs.existsSync(path) ) {
            fs.unlinkSync( path );
        }
        console.log('deleteFile success');
    }
}
