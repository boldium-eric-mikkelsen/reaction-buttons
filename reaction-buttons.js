/**
 * Gets the post ID from the Wordpress body class
 * Wordpress adds post id classes to the body tag
 * They look like this: postid-21840
 * @returns {str|false} either returns the id of the post, or false if it can't find it
 */
const getPostIDFromBody = () => {
    let postID = false;
    // Loop through all the classes on the body tag
    // looking for one that starts with postid-
    // that's our post ID
    document.body.classList.forEach(cls => {
        if (cls.startsWith('postid-')) {
            postID = cls.split('-')[1];
        }
    })
    return postID
}
const reaction_buttons_already_voted = (el) => {
    alert(el.dataset.alreadyVotedText);
}
/**
 * Reaction Buttons javascript. Uses ajax to get a vote, disable the
 * possibility to vote and refresh the counter.
 */
function reaction_buttons_increment_button_ajax(el) {
    const button = el.dataset.buttonId;
    const post_id = getPostIDFromBody();
    const config = document.getElementById('js-reaction-buttons-config').dataset;
    var already_voted_text = config.alreadyVotedText;
    var only_one_vote = JSON.parse(config.onlyOneVote);
    var show_after_votes = JSON.parse(config.showAfterVotes);
    const siteUrl = config.siteUrl;
    var use_as_counter = JSON.parse(config.useAsCounter);
    var use_percentages = JSON.parse(config.usePercentages);
    var buttons = config.buttons.split(',');
    if ( !use_as_counter && el.classList.contains("voted") ) {
        return;
    }

    if (!use_as_counter) {
        // remove the href attribute before sending the request to make
        // sure no one votes more than once by clicking ten times fast
        if (only_one_vote) {
            // remove all the onclicks from the posts and replace it by the
            // alert not to vote twice if set
            if (already_voted_text) {
                jQuery("#reaction_buttons_post" + post_id + " .reaction_button").attr('onclick', 'javascript:alert(\'' + already_voted_text + '\');');
            }
            else {
                jQuery("#reaction_buttons_post" + post_id + " .reaction_button").removeAttr('onclick');
            }
        }
        else {
            // remove/replace only on the clicked button
            if (already_voted_text) {
                jQuery("#reaction_buttons_post" + post_id + " .reaction_button_" + button).attr('onclick', 'javascript:alert(\'' + already_voted_text + '\');');
            }
            else {
                jQuery("#reaction_buttons_post" + post_id + " .reaction_button_" + button).removeAttr('onclick');
            }
        }
    }
    jQuery.ajax({
        type: "post", 
        url: config.siteUrl + `/wp-admin/admin-ajax.php`, 
        dataType: 'json',
        data: { 
            action: 'reaction_buttons_increment_button_php', 
            post_id: post_id, 
            button: button, 
            _ajax_nonce: config.nonce
        },
        success: function (data) {
            if (use_percentages) {
                var i;
                var b;
                for (i = 0; i < buttons.length; ++i) {
                    b = buttons[i];
                    jQuery("#reaction_buttons_post" + post_id + " .reaction_button_" + b + " .count_number").html(data['percentage'][b]);
                }
            }
            else if (show_after_votes) {
                var i;
                var b;
                for (i = 0; i < buttons.length; ++i) {
                    b = buttons[i];
                    jQuery("#reaction_buttons_post" + post_id + " .reaction_button_" + b + " .count_number").html(data['counts'][b]);
                }
            }
            else {
                jQuery("#reaction_buttons_post" + post_id + " .reaction_button_" + button + " .count_number").html(data['count']);
            }
            if (only_one_vote) {
                jQuery("#reaction_buttons_post" + post_id + " .reaction_button").addClass('voted');
                jQuery("#reaction_buttons_post" + post_id + " .reaction_button_" + button).addClass('rb_chosen');
            }
            else {
                jQuery("#reaction_buttons_post" + post_id + " .reaction_button_" + button).addClass('voted');
            }
            if (show_after_votes) {
                jQuery("#reaction_buttons_post" + post_id + " .reaction_button .braces").removeAttr('style');
            }
        }
    });
}
const reactionButton = (button) => {
    button.addEventListener('click', () => {
        if (button.dataset.VotedText) {
            reaction_buttons_already_voted(button);
        } else {
            reaction_buttons_increment_button_ajax(button);
        }
    })
}
const reactionButtons = (selector = '.js-reaction_button') => {
    const buttons = document.querySelectorAll(selector);
    buttons.forEach(button => reactionButton(button));
}
reactionButtons();