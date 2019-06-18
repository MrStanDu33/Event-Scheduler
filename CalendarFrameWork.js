var extend = function ()
{
	var extended = {};
	var deep = false;
	var i = 0;
	var length = arguments.length;
	if (Object.prototype.toString.call( arguments[0] ) === '[object Boolean]')
	{
		deep = arguments[0];
		i++;
	}
	var merge = function (obj)
	{
		for (var prop in obj)
		{
			if (Object.prototype.hasOwnProperty.call(obj, prop))
			{
				if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]')
				{
					extended[prop] = extend(true, extended[prop], obj[prop]);
				}
				else
				{
					extended[prop] = obj[prop];
				}
			}
		}
	};
	for ( ; i < length; i++ )
	{
		var obj = arguments[i];
		merge(obj);
	}
	return extended;
};

var customCalendar = function (options)
{
	this.settings = extend(true, {}, this.defaultOptions, options);
	if (this.settings.CORSProxy)
		this.settings.url = "/app.php?CORSProxy="+encodeURIComponent(this.settings.url);
	this.displayed = {};
	this.displayed.referral = new Date();
	this.container = document.getElementById(this.settings.calendarId);
	this.monthContainer = document.getElementById(this.settings.monthContainerId);
	this.eventContainer = document.getElementById(this.settings.eventContainerId);
	this.events = [];
	this.getEvents();
	this.setYear();
	this.setMonth();
	if (this.container)
		this.buildCalendar();
	if (this.monthContainer)
		this.printMonthTitle();
	if (this.eventContainer)
		this.printEventList();
};

customCalendar.prototype =
{
	Event: class Event
	{
		constructor(data)
		{
			var i = 0;
			while (i < data.length)
			{
				let key = data.slice(i, data.indexOf(":", i));
				let endValue = data.indexOf("\n", i);
				while (data[endValue + 1] === " ")
				{
					data = data.slice(0, endValue) + data.slice(endValue + 2);
					endValue = data.indexOf("\n", endValue - 1) + 1;
				}
				let value = data.slice(data.indexOf(":", i) + 1, endValue);
				i = i + key.length + value.length + 2;
				value = value.replace(/(\r\n|\n|\r)/gm, "");
				this[key] = value;
			}
			let startDate = this.DTSTART.substr(0, this.DTSTART.indexOf("T"));
			let endDate = this.DTSTART.substr(0, this.DTSTART.indexOf("T"));
			this.start = {};
			this.start.year = startDate.substr(0, 4);
			this.start.month = startDate.substr(4, 2);
			this.start.day = startDate.substr(6, 2);
			this.end = {};
			this.end.year = endDate.substr(0, 4);
			this.end.month = endDate.substr(4, 2);
			this.end.day = endDate.substr(6, 2);
		}
	},

	buildEvents: function()
	{
		var i = this.eventData.indexOf("BEGIN:VEVENT", i);
		while (this.eventData.indexOf("BEGIN:VEVENT", i) > 0)
		{
			let start = this.eventData.indexOf("BEGIN:VEVENT", i) + 14;
			let end = this.eventData.indexOf("END:VEVENT", start);
			let eventData = this.eventData.slice(start, end);
			event = new this.Event(eventData);
			this.events[event.DTSTART.slice(0, event.DTSTART.indexOf("T"))] = event;
			i = i + eventData.length;
		}
		if (this.container)
			this.printEventsDays();
	},

	getEvents: function()
	{
		var self = this;
		var xhr = new XMLHttpRequest();
		xhr.open("GET", this.settings.url, true);
		xhr.onload = function(e)
		{
			if (xhr.readyState === 4 && xhr.status === 200 && xhr.responseText.length != 0)
			{
				self.eventData = xhr.responseText;
				self.buildEvents();
			}
		};
		xhr.send(null);
	},

	setYear: function()
	{
		this.displayed.year = this.displayed.referral.getFullYear();
	},

	setMonth: function()
	{
		this.displayed.month = this.settings.months[this.displayed.referral.getMonth()]
	},

	buildCalendar: function()
	{
		let table = document.createElement("table");
		this.container.appendChild(table);
		let tbody = document.createElement("tbody");
		table.appendChild(tbody);
		this.printDaysHeader();
		this.printDays();
	},

	printMonthTitle: function()
	{
		this.monthContainer.innerHTML = this.displayed.month;
	},

	printDaysHeader: function()
	{
		let daysHeader = document.createElement("tr");
		this.container.getElementsByTagName("tbody")[0].appendChild(daysHeader);
		daysHeader.classList.add("days");
		var i = 0;
		this.settings.days.forEach(day =>
		{
			let td = document.createElement("td");
			td.style.color = this.settings.altColor;
			td.innerHTML = day;
			daysHeader.appendChild(td);
		});
	},

	printDays: function()
	{
		let startDay = this.getFirstDayIndex(this.getFirstDayName(this.displayed.referral));
		var i = 0;
		var week = 0;
		while ((i - startDay) != this.getLastDayNumber(this.displayed.referral))
		{
			if (!(i % 7))
			{
				week = document.createElement("tr");
				this.container.getElementsByTagName("tbody")[0].appendChild(week);
			}
			let day = document.createElement("td");
			if (i >= startDay)
				day.innerHTML = i - startDay + 1;
			if (i - startDay + 1 == this.getDay(this.displayed.referral))
				day.classList.add("active");
			if (this.settings.weekend.indexOf(this.settings.days[(i%7)]) !== -1)
				day.style.color = this.settings.altColor;
			day.dataset.day = i - startDay + 1;
			week.appendChild(day);
			i++;
		}
	},

	getDay: function(date)
	{
		return(date.getDate());
	},

	getFirstDayName: function(day)
	{
		let date = new Date(day);
		let month = date.getMonth();
		let year = date.getFullYear();
		let FirstDay = new Date(year, month, 1);
		return(this.settings.days[FirstDay.getDay() - 1]);
	},

	getLastDayNumber: function(date)
	{
		return(new Date(date.getMonth(), date.getYear(), 0).getDate());
	},

	getFirstDayIndex: function(day)
	{
		return(this.settings.days.indexOf(day));
	},

	printEventsDays: function()
	{
		this.events.forEach(event =>
		{
			if (event.start.year == this.displayed.year && this.settings.months[Number(event.start.month) - 1] == this.displayed.month)
			{
				this.container.querySelector('td[data-day="'+Number(event.start.day)+'"]').classList.add("event");
			}
		});
	},

	printEventList: function()
	{
		return;
	},
};

function CalendarFrameWork (settings)
{
	Object.defineProperty(this, 'defaultOptions',
	{
		value:
		{
			calendarId: "",
			monthContainerId: "",
			eventContainer: "",
			weekend: ["S", "S"],
			days: ["S", "M", "T", "W", "T", "F", "S"],
			months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "Décember"],
			url: "",
			altColor: "#B7B7B7",
			CORSProxy: false,
		},
		writable: false,
		enumerable: true,
		configurable: false
	});
	return (new customCalendar(settings));
}