class Event
{
	constructor(data)
	{
		var i = 0;
		while (i < data.length)
		{
			let key = data.slice(i, data.indexOf(":", i));
			let value = data.slice(data.indexOf(":", i) + 1, data.indexOf("\n", i));
			this[key] = value;
			i = i + key.length + value.length + 2;
		}
	}
}

class Calendar
{
	constructor(url)
	{
		this.eventData =  [];
		this.events = [];
		$.ajax(
		{
			type: 'GET',
			url: url,
			context: this,
		}).
		done(function(data)
		{
			if (data.length != 0)
			{
				this.eventData = data;
				this.buildEvents();
			}
		});
	}

	buildEvents()
	{
		var i = this.eventData.indexOf("BEGIN:VEVENT", i);
		while (this.eventData.indexOf("BEGIN:VEVENT", i) > 0)
		{
			let start = this.eventData.indexOf("BEGIN:VEVENT", i) + 14;
			let end = this.eventData.indexOf("END:VEVENT", start);
			let eventData = this.eventData.slice(start, end);
			event = new Event(eventData);
			this.events[event.DTSTART.slice(0, event.DTSTART.indexOf("T"))] = event;
			i = i + eventData.length;
		}
	}
}

var calendar = new Calendar("/calendar.ics");
console.log(calendar);