(function()
{
	window.onload = function()
	{
		var calendar = calendarFrameWork(
		{
			url: "./calendar.ics",
			months: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
			days: {
				monday: "L",
				tuesday: "M",
				wednesday: "M",
				thursday: "J",
				friday: "V",
				saturday: "S",
				sunday: "D"
			},
			firstDayOfWeek: "monday",
			weekend: ["saturday", "sunday"],
			calendarId: "calendar",
			monthContainerId: "month",
			onDayClick: function()
			{
				console.log(event);
			},
/*
			onEvents: function(event)
			{
				console.log(event)
			},
*/
			onEvents: "calendar",
/*
			onEvents: {
				dayNumberClass: "day",
				dayNumberClass: "day",
			},
*/
		});
		console.log(calendar);
	};
})();