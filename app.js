(function()
{
	window.onload = function()
	{
		var calendar = calendarFrameWork(
		{
			url: "/calendar.ics",
			months: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
			days: ["L", "M", "M", "J", "V", "S", "D"],
			weekend: ["S", "D"],
			CORSProxy: true,
			calendarId: "calendar",
			monthContainerId: "month",
			eventContainer: "eventContainer",
		});

		console.log(calendar);
	}
})();