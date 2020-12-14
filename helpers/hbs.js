const moment = require('moment')
const Users = require('../models/Users')


module.exports = {
	formatDate: function (date, format) {
		return moment(date).format(format)
	},

	truncate: function (str, len) {
		if (str.length > len && str.length > 0) {
			let new_str = str + ' '
			new_str = str.substr(0, len)
			new_str = str.substr(0, new_str.lastIndexOf(' '))
			new_str = new_str.length > 0 ? new_str : str.substr(0, len)
			return new_str + '...'
		}
		return str
	},

	stripTags: function (input) {
		return input.replace(/<(?:.|\n)*?>/gm, '')
	},

	editIcon: function (storyUser, loggedUser, storyId) {
		if (storyUser._id.toString() == loggedUser._id.toString()) {
			return `<a href="/stories/edit/${storyId}" class="card-link float-right"><i class="fas fa-edit"></i></a>`
		} else {
			return ''
		}
	},

	select: function (selected, options) {
		return options
			.fn(this)
			.replace(
				new RegExp('value="' + selected + '"'),
				'$& selected="selected"'
			)
			.replace(
				new RegExp('>' + selected + '</option>'),
				'selected="selected"$&'
			)
	},
	
	fetchdetail : function (userId) {
		Users.find({_id:userId}).then ((error,data)=>{
			if (error)
				console.log(error)
			else
				console.log(data.displayName)
		})
	}, 

	if_eq: function (a, b, options) {
		if (a == b) {
			return options.inverse(this)
		} else {
			return options.fn(this)
		}
	},

	isSameUser: function (storyUser, loggedUser, story) {
		if (storyUser._id.toString() == loggedUser._id.toString()) {
			return ''
		} else {
			return `
            <div class="row justify-content-left py-2">
                <a href="/stories/like/${story._id}" class="card-link text-info px-3">${story.likes} <i class="fas fa-thumbs-up"></i> Like</a>
                <a href="/stories/report/${story._id}" class="card-link text-danger px-3">${story.reports} <i class="fas fa-flag "></i> Report</a>
                <a href="/stories/payment/${storyUser._id.toString()}" class="card-link text-warning px-5 pull-right"><i class="fas fa-hand-holding-usd"></i> Donate</a>
            </div>
            `
		}
	},
}
