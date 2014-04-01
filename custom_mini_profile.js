/**
 * Custom Mini-Profile Background - ProBoards Plugin
 * Version 1.2.1
 * Keys Used: Super User Key
 *
 * Written by Bob Hensley (bob@bobbyhensley.com)
 *
 * Licensed under GNU General Public (GPL) Version 2
 * See http://choosealicense.com/licenses/gpl-v2/ for license details
 */

var CustomMiniProfile = {

  /**
   * Key containing the URL of the user's personal background.
   * @type string
   */
  uKey: pb.plugin.key('mp_bg_url'),

  /**
   * Array of JSON objects, containing settings for group backgrounds.
   * @type array -> @object
   */
  gBgs: pb.plugin.get('custom_miniprofile_backgrounds').settings.group_backgrounds,

  /**
   * Loops through all mini-profiles.  On each iteration grab the user ID and
   * group ID.  Pass that off to supporting methods, to determine what, if any,
   * background to use.  Apply CSS if necessary.
   *
   * @return void
   */
  init: function () {
    var self = this;

    $('.mini-profile').each(function () {
      var uid = null,
        gid = null;

      if ($(this).children().first().attr('href').match(/user\/(\d+)$/)) {
        uid = RegExp.$1;
      }

      if ($(this).children().first().attr('class').match(/group-(\d+)/)) {
        gid = RegExp.$1;
      }

      var bg = self.determine_background(uid, gid);

      if (bg) {
        $(this).css('background-image', 'url(' + bg + ')');
      }
    });
  },

  /**
   * Determine whether to use (if it exists) the personal background or
   * a group background.  Personal backgrounds override group backgrounds
   * by default.
   *
   * @return null
   * @return string (URL to image)
   */
  determine_background: function (uid, gid) {
    if (!uid || !gid) {
      return null;
    }

    var self    = this,
      bg        = null,
      override  = false;

    for (var i = 0, len = self.gBgs.length; i < len; i++) {
      if ($.inArray(gid, self.gBgs[i].groups) > -1) {
        bg        = self.gBgs[i].image_url;
        override  = self.gBgs[i].override_personal;

        break;
      }
    }

    if (self.uKey.get(uid) !== undefined && (!override || override === 'no')) {
      bg = self.uKey.get(uid);
    }

    return bg;
  },

  /**
   * Sanitize the image URL; no scripts are being run by us.
   *
   * @return string (clean URL)
   */
  clean_url: function (url) {
    return url
      .replace(/</g, '')
      .replace(/>/g, '')
      .replace(/'/g, '')
      .replace(/"/g, '')
  },

  /**
   * Create a new field in the edit personal screen, containing the text input
   * and submit button needed to add/update/remove a personal background.  Set
   * onclick functionality to the button (tell it to save the text input).
   *
   * @return void
   */
  create_field: function () {
    var self  = this,
      uId     = pb.data('route').params.user_id,
      curVal  = self.uKey.get(uId);

    $('.form_user_edit_personal').parent()
      .after('<div class="personal content-box"><div class="custom-field-miniprofilebackground"><label>Mini-Profile Background Image (URL)</label><input id="mpbiurl" class="full-width" type="text" value="' + curVal + '" name="mpbiurl" maxlength="1024"><input type="button" value="Update" id="mpbiupdate"></div></div>');
    
    $('#mpbiupdate').click(function () {
      self.save_field(uId);
    });
  },

  /**
   * Save the personal background URL (or lack thereof) to the pertinent key.
   * Also perform crude error checking by comparing new key value to the
   * value of the input.  Same?  Good.  Not?  Not good.
   *
   * @return void
   */
  save_field: function (id) {
    var self  = this,
      imgUrl  = '';

    if ($('#mpbiurl').val().match(/http.+?\.(jpg|jpeg|gif|png)/i)) {
      imgUrl = self.clean_url($('#mpbiurl').val());
    }

    self.uKey.set({ object_id: id, value: imgUrl });

    if (self.uKey.get(id) == imgUrl) {
      $('#mpbiurl').css('border-color', 'green');
    } else {
      $('#mpbiurl').css('border-color', 'red');
    }
  }
}

$(document).ready(function () {
  switch (pb.data('route').name) {
    case 'all_recent_posts':
    case 'conversation':
    case 'thread':
      CustomMiniProfile.init();
      break;

    case 'edit_user_personal':
      CustomMiniProfile.create_field();
      break;
  }
});