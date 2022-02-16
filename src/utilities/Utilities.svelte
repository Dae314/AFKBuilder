<script context="module">
	// receive time in number of milliseconds
	// return human readable interpretation of time (string)
	export function msToString(time) {
		// expect time to be number of milliseconds
		// return seconds if time is < 1 minute
		if(time < 6e4) return `a few seconds ago`;
		// return minutes if time is < 1 hour
		if(time < 3.6e6) return `${Math.floor(time/6e4)} min ago`;
		// return hours if time is < 1 day
		if(time < 8.64e7) return `${Math.floor(time/3.6e6)} hours ago`;
		// return days if time is < 1 month
		if(time < 2.592e9) return `${Math.floor(time/8.64e7)} days ago`;
		// return months if time is < 1 year
		if(time < 3.156e10) return `${Math.floor(time/2.592e9)} months ago`;
		// return years if time is >= 1 year
		return `${Math.floor(time/3.156e10)} years ago`;
	}

	// receive raw vote count (int)
	// return human readable vote count summary (string)
	export function votesToString(votes) {
		// return votes if votes is < 1k
		if(votes < 1e3) return votes;
		// return #.#k if votes is < 1m
		if(votes < 1e6) return `${Math.round((votes/1e3) * 10)/10}k`;
		// return #.#m if votes is < 1b
		if(votes < 1e9) return `${Math.round(votes/1e6 * 10)/10}m`;
		// return 'a lot' if votes is >= 1b
		return 'a lot';
	}
</script>
