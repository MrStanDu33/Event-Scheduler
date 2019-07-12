var extend = function ()
{
	var extended = {};
	var deep = false;
	var i = 0;
	var length = arguments.length;
	if (Object.prototype.toString.call( arguments[0] ) === "[object Boolean]")
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
				if (deep && Object.prototype.toString.call(obj[prop]) === "[object Object]")
					extended[prop] = extend(true, extended[prop], obj[prop]);
				else
					extended[prop] = obj[prop];
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

var CalendarFrameWork = function (options)
{
	Object.defineProperty(this, "defaultOptions",
	{
		value:
		{
			calendarId: "",
			monthContainerId: "",
			weekend: ["saturday", "sunday"],
			days: 
			{
				sunday: "S",
				monday: "M", 
				tuesday: "T",
				wednesday: "W",
				thursday: "T",
				friday: "F",
				saturday: "S",
			},
			firstDayOfWeek: "sunday",
			months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "Décember"],
			url: "",
			altColor: "#B7B7B7",
			CORSProxy: false,
			onDayClick: function(event){},
			prevMonthClick: function(){},
			nextMonthClick: function(){},
			onEvents: 0,
		},
		writable: false,
		enumerable: true,
		configurable: false
	});

	this.settings = extend(true, {}, this.defaultOptions, options);
	this.orderDays();
	if (this.settings.CORSProxy)
		this.settings.url = "/app.php?CORSProxy="+encodeURIComponent(this.settings.url);
	this.container = document.getElementById(this.settings.calendarId);
	this.monthContainer = document.getElementById(this.settings.monthContainerId);
	this.events = [];
	this.getEvents();
};

CalendarFrameWork.prototype =
{
	Event: class Event
	{
		constructor(data)
		{
			var i = 0;
			while (i < data.length)
			{
				let originalKey = data.slice(i, data.indexOf(":", i));
				var key = "";
				if (originalKey.includes("DTSTART;TZID") || originalKey.includes("DTSTART;VALUE=DATE"))
					key = "DTSTART";
				else if (originalKey.includes("DTEND;TZID") || originalKey.includes("DTEND;VALUE=DATE"))
					key = "DTEND";
				else
					key = originalKey;
				let endValue = data.indexOf("\n", i);
				while (data[endValue + 1] == " ")
				{
					data = data.slice(0, endValue) + data.slice(endValue + 2);
					endValue = data.indexOf("\n", endValue + 1);
				}
				let value = data.slice(data.indexOf(":", i) + 1, endValue);
				i = i + originalKey.length + value.length + 2;
				value = value.replace(/(\\r\\n|\\n|\\r|\\)/gm, "");
				this[key] = value;
			}
			let startDate = this.DTSTART;
			let endDate = this.DTEND;
			this.buildTimeStamp(startDate, "start");
			this.buildTimeStamp(endDate, "end");
		}

		buildTimeStamp(str, spot)
		{
			this[spot] = {};
			this[spot].year = str.substr(0, 4);
			this[spot].month = str.substr(4, 2);
			this[spot].day = str.substr(6, 2);
			if (str.includes("T"))
			{
				this[spot].hour = str.substr(9, 2);
				this[spot].minute = str.substr(11, 2);
				this[spot].seconds = str.substr(13, 3);
			}
		}
	},

	buildEvents: function()
	{
		var i = this.eventData.indexOf("BEGIN:VEVENT");
		while (this.eventData.indexOf("BEGIN:VEVENT", i) > 0)
		{
			let start = this.eventData.indexOf("BEGIN:VEVENT", i) + 14;
			let end = this.eventData.indexOf("END:VEVENT", start);
			let eventData = this.eventData.slice(start, end);
			event = new this.Event(eventData);
			this.events[event.DTSTART.slice(0, event.DTSTART.indexOf("T"))] = event;
			i = i + eventData.length;
		}
		this.generateCalendar(new Date());
	},

	getEvents: function()
	{
		var self = this;
		var xhr = new XMLHttpRequest();
		xhr.open("GET", this.settings.url, true);
		xhr.onload = function(e)
		{
			if (xhr.readyState === 4 && xhr.status === 200 && xhr.responseText.length !== 0)
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
		this.displayed.month = this.settings.months[this.displayed.referral.getMonth()];
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
		this.monthContainer.textContent = this.displayed.month;
	},

	printDaysHeader: function()
	{
		let daysHeader = document.createElement("tr");
		this.container.getElementsByTagName("tbody")[0].appendChild(daysHeader);
		daysHeader.classList.add("days");
		var i = 0;
		let self = this;
		for (let day in this.settings.days)
		{
			if (Object.prototype.hasOwnProperty.call(this.settings.days, day))
			{
				let td = document.createElement("td");
				td.style.color = self.settings.altColor;
				td.textContent = this.settings.days[day][1];
				daysHeader.appendChild(td);
			}
		}
	},

	printDays: function()
	{
		let startDay = this.getFirstDayName(this.getFirstDayIndex(this.displayed.referral));
		let startDayOffset = this.getFirstDayIndex(this.displayed.referral);
		var i = 0;
		var week = 0;
		let weeks = 0;
		while ((i - startDayOffset) != this.getLastDayNumber(this.displayed.referral))
		{
			if (!(i % 7))
			{
				weeks++;
				week = document.createElement("tr");
				this.container.getElementsByTagName("tbody")[0].appendChild(week);
			}
			let day = document.createElement("td");
			if ((i < startDayOffset) || (i >= startDayOffset))
			{
				if (!((i - startDayOffset + 1) > 0))
					day.classList.add("toFill");
				day.textContent = i - startDayOffset + 1;
			}
			if (i - startDayOffset + 1 == this.getDay(this.displayed.referral))
				day.classList.add("active");
			if (this.settings.weekend.indexOf(this.settings.days[(i%7)][0]) !== -1)
				day.style.color = this.settings.altColor;
			day.dataset.day = i - startDayOffset + 1;
			week.appendChild(day);
			i++;
		}
		
		//Print end of prev Month
		let toFill= this.container.getElementsByClassName("toFill");
		let toFillArray = [];
		for (let i = 0; i < toFill.length; i++)
		{
			toFillArray.push(toFill[i]);
		}
		toFillArray.reverse();
		let startReverse = this.getLastDayNumber(this.getPrevMonth(this.displayed.referral));
		let self = this;
		toFillArray.forEach(function(index)
		{
			index.textContent = startReverse;
			index.style.color = self.settings.altColor;
			index.style.fontWeight = 100;
			startReverse--;
		});

		//Print 1 week of next Month
		while (weeks != 7)
		{
			if (weeks == 6 && !(i % 7))
				return;
			if (!(i % 7))
			{
				weeks++;
				week = document.createElement("tr");
				this.container.getElementsByTagName("tbody")[0].appendChild(week);
			}
			let day = document.createElement("td");
			day.textContent = i - this.getLastDayNumber(this.displayed.referral) - 1;
			day.style.color = this.settings.altColor;
			day.style.fontWeight = 100;
			day.dataset.day = i - startDayOffset + 1;
			week.appendChild(day);
			i++;
		}
	},

	generateCalendar: function(date)
	{
		this.displayed = {};
		this.displayed.referral = date;
		this.setYear();
		this.setMonth();
		if (this.container)
		{
			this.buildCalendar();
			this.printEventsDays();
		}
		if (this.monthContainer)
			this.printMonthTitle();
		switch (typeof this.settings.onEvents)
		{
			case "function":
				this.bindEventFunction();
				break;
			case "string":
				this.bindEventContainer();
				break;
			case "object":
				this.bindEventTemplate();
				break;
		}
	},

	bindEventContainer: function()
	{
		this.eventContainer = document.getElementById(this.settings.onEvents);
		let self = this;
		this.events.forEach(function(index)
		{
			if (index.start.year == self.displayed.year && self.settings.months[index.start.month - 1]== self.displayed.month)
			{
				let eventNode = document.createElement("div");
				eventNode.classList.add("eventSchedule");
				self.eventContainer.appendChild(eventNode);
				let day = document.createElement("span");
				if (index.start.hour && index.start.minute && index.start.seconds && index.end.hour && index.end.minute && index.end.seconds)
					day.textContent = index.start.day;
				else
					day.textContent = index.start.day + " - " + index.end.day;
				day.classList.add("day");
				eventNode.appendChild(day);
				let hour = document.createElement("span");
				if (index.start.hour && index.start.minute && index.start.seconds && index.end.hour && index.end.minute && index.end.seconds)
				{
					if (index.CATEGORIES)
						hour.textContent = index.start.hour + "h - " + index.end.hour +"h " + index.CATEGORIES;
					else
						hour.textContent = index.start.hour + "h - " + index.end.hour +"h";
				}
				else
					hour.textContent = "toute la journée ";
				hour.classList.add("hour");
				eventNode.appendChild(hour);
				if (index.SUMMARY)
				{
					let title = document.createElement("span");
					title.textContent = index.SUMMARY;
					title.classList.add("title");
					eventNode.appendChild(title);
				}
				if (index.DESCRIPTION)
				{
					let desc = document.createElement("p");
					desc.textContent = index.DESCRIPTION;
					desc.classList.add("description");
					eventNode.appendChild(desc);
				}
			}
		});
		if (this.container.childNodes.length % 2)
		{
			let eventNode = document.createElement("div");
			eventNode.classList.add("eventSchedule", "emptyPlaceholder");
			self.eventContainer.appendChild(eventNode);
			eventNode.style.border = "none";
		}
	},

	bindEventFunction: function()
	{
		let self = this;
		this.events.forEach(function(index)
		{
			if (index.start.year == self.displayed.year && self.settings.months[index.start.month - 1]== self.displayed.month)
			{
				self.settings.onEvents(index);
			}
		});
	},

	orderDays: function()
	{
		let i = 0;
		let day = 6;
		let self = this;
		var result = Object.keys(this.settings.days).map(function(key)
		{
			return [key, self.settings.days[key]];
		});
		for (let index = 0; index < result.length; index++)
		{
			if (result[index][0] == this.settings.firstDayOfWeek)
			{
				i = index;
				continue;
			}
		}
		let days = [];
		while (day != -1)
		{
			if (!result[i])
				i = 0;
			days.push(result[i]);
			i++;
			day--;
		}
		this.settings.days = days;
	},

	getDay: function(date)
	{
		return(date.getDate());
	},

	getLastDayNumber: function(date)
	{
		return(new Date(date.getFullYear(), date.getMonth()+1, 0).getDate());
	},

	getFirstDayName: function(index)
	{
		return(this.settings.days[index][0]);
	},

	getFirstDayIndex: function(day)
	{
		let date = new Date(day);
		let month = date.getMonth();
		let year = date.getFullYear();
		let FirstDay = new Date(year, month, 1);
		return(FirstDay.getDay() - 1);
	},

	getPrevMonth: function(date)
	{
		return(new Date(date.getFullYear(), date.getMonth(), 0));
	},

	printEventsDays: function()
	{
		for (let eventNode in this.events)
		{
			if (Object.prototype.hasOwnProperty.call(this.events, eventNode))
			{
				let event = this.events[eventNode];
				if (event.start.year == this.displayed.year && this.settings.months[Number(event.start.month) - 1] == this.displayed.month)
				{
					let day = null;
					if (event.start.hour)
					{
						day = this.container.querySelector("td[data-day=\""+Number(event.start.day)+"\"]");
						day.classList.add("event");
						day.onclick = this.settings.onDayClick;
					}
					else
					{
						let i = Number(event.start.day);
						while (i != Number(event.end.day) + 1)
						{
							day = this.container.querySelector("td[data-day=\""+Number(i)+"\"]");
							day.classList.add("event");
							day.onclick = this.settings.onDayClick;
							i++;
						}
					}
				}
			}
		}
	},

	printEventList: function()
	{
		return;
	},
};

function calendarFrameWork(settings)
{
	return (new CalendarFrameWork(settings));
}