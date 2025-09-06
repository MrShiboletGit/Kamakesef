(function () {
	const form = document.getElementById('calcForm');
	const partySizeInput = document.getElementById('partySize');

	const amountEl = document.getElementById('amount');
	const amountWordsEl = document.getElementById('amountWords');
	const chequeDateEl = document.getElementById('chequeDate');
	const voteBox = document.getElementById('voteBox');
	const votesCountEl = document.getElementById('votesCount');
	const cheque = document.getElementById('cheque');
	const publicVotesList = document.getElementById('publicVotesList');
	const emptyState = document.getElementById('emptyState');
	const totalVotesEl = document.getElementById('totalVotes');
	const totalUsersEl = document.getElementById('totalUsers');
	const voteNotifications = document.getElementById('voteNotifications');

	const votesStorageKey = 'wedding-calc-votes-v1';
	const votedScenariosKey = 'wedding-calc-voted-scenarios-v1';
	// Always use the live server API
	const API_BASE = 'https://www.kamakesef.com/api';
	
	console.log('API_BASE set to:', API_BASE);
	console.log('Current hostname:', window.location.hostname);
	console.log('Current port:', window.location.port);
	console.log('Full URL:', window.location.href);
	
	// Real-time updates
	let lastVoteCount = 0;
	let pollInterval;

	function shekelsToWords(n) {
		const formatter = new Intl.NumberFormat('he-IL');
		return formatter.format(n) + ' שקלים חדשים';
	}

	function formatCurrency(n) {
		return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(n);
	}

	function getVotes() {
		try {
			return JSON.parse(localStorage.getItem(votesStorageKey)) || { tooLow: 0, justRight: 0, tooHigh: 0 };
		} catch (e) {
			return { tooLow: 0, justRight: 0, tooHigh: 0 };
		}
	}

	function setVotes(v) {
		localStorage.setItem(votesStorageKey, JSON.stringify(v));
	}

	function getVotedScenarios() {
		try {
			return JSON.parse(localStorage.getItem(votedScenariosKey)) || [];
		} catch (e) {
			return [];
		}
	}

	function setVotedScenarios(scenarios) {
		localStorage.setItem(votedScenariosKey, JSON.stringify(scenarios));
	}



	function generateScenarioKey(scenario) {
		// Core factors only - these determine the vote buckets
		return `${scenario.eventType}-${scenario.closeness}-${scenario.venue}-${scenario.location}`;
	}

	function hasVotedOnScenario(scenario) {
		const votedScenarios = getVotedScenarios();
		const scenarioKey = generateScenarioKey(scenario);
		return votedScenarios.includes(scenarioKey);
	}

	function markScenarioAsVoted(scenario) {
		const votedScenarios = getVotedScenarios();
		const scenarioKey = generateScenarioKey(scenario);
		if (!votedScenarios.includes(scenarioKey)) {
			votedScenarios.push(scenarioKey);
			setVotedScenarios(votedScenarios);
		}
	}

	function getVoteHistory() {
		try {
			return JSON.parse(localStorage.getItem('wedding-calc-vote-history-v1')) || [];
		} catch (e) {
			return [];
		}
	}

	function addToVoteHistory(scenario, amount, voteType, impact = 0) {
		const history = getVoteHistory();
		
		const historyItem = {
			timestamp: new Date().toISOString(),
			scenario: scenario,
			amount: amount,
			voteType: voteType,
			impact: impact, // Store the price impact of this vote
			scenarioKey: generateScenarioKey(scenario)
		};
		
		console.log('Storing vote in history:', historyItem);
		
		history.unshift(historyItem); // Add to beginning
		
		// Keep only last 20 items
		if (history.length > 20) {
			history.splice(20);
		}
		
		localStorage.setItem('wedding-calc-vote-history-v1', JSON.stringify(history));
		console.log('Vote history updated, total items:', history.length);
	}


	function formatScenarioDisplay(scenario) {
		const eventNames = {
			'wedding': 'חתונה',
			'bar-bat': 'בר/בת מצווה',
			'brit': 'ברית',
			'other': 'אירוע אחר'
		};
		
		const closenessNames = {
			'distant': 'מכרים',
			'distantFamily': 'משפחה רחוקה',
			'friend': 'חברים',
			'close': 'קרובים',
			'inner': 'משפחה קרובה'
		};
		
		const venueNames = {
			'home': 'חצר/בית/בית כנסת',
			'garden': 'גן אירועים',
			'hall': 'אולם',
			'restaurant': 'מסעדה'
		};
		
		const locationNames = {
			'center': 'מרכז',
			'north': 'צפון',
			'south': 'דרום',
			'jerusalem': 'ירושלים'
		};
		
		const partySizeText = scenario.partySize ? ` • ${scenario.partySize} אנשים` : '';
		return `${eventNames[scenario.eventType]} • ${closenessNames[scenario.closeness]}${partySizeText} • ${venueNames[scenario.venue]} • ${locationNames[scenario.location]}`;
	}

	// Public vote functions
	async function fetchPublicVotes() {
		try {
			console.log('Fetching public votes from API...');
			const response = await fetch(`${API_BASE}/public-votes`);
			if (response.ok) {
				const data = await response.json();
				console.log('Public votes API response:', data);
				updatePublicVotesDisplay(data.votes);
				return data.totalVotes;
			} else {
				console.log('Public votes API failed:', response.status, response.statusText);
			}
		} catch (error) {
			console.log('API not available for public votes:', error);
		}
		return 0;
	}

	async function fetchPublicStats() {
		try {
			console.log('Fetching public stats from:', `${API_BASE}/public-stats`);
			const response = await fetch(`${API_BASE}/public-stats`);
			console.log('Public stats response status:', response.status, response.statusText);
			if (response.ok) {
				const data = await response.json();
				console.log('Public stats data received:', data);
				updatePublicStats(data);
			} else {
				console.error('Public stats API failed:', response.status, response.statusText);
			}
		} catch (error) {
			console.error('API not available for public stats:', error);
		}
	}

	function updatePublicStats(stats) {
		console.log('Updating public stats:', stats);
		if (totalVotesEl) {
			animateCountUp(totalVotesEl, stats.totalVotes);
		} else {
			console.error('totalVotesEl element not found!');
		}
		// Note: totalUsersEl doesn't exist in the HTML, so we skip it
	}

	function updatePublicVotesDisplay(votes) {
		if (votes.length === 0) {
			emptyState.style.display = 'block';
			publicVotesList.innerHTML = '';
			publicVotesList.appendChild(emptyState);
			return;
		}
		
		emptyState.style.display = 'none';
		
		// Create a temporary container to build the new content
		const tempContainer = document.createElement('div');
		
		votes.forEach((vote, index) => {
			const voteItem = document.createElement('div');
			voteItem.className = 'public-vote-item';
			
			const voteText = {
				'tooLow': '📉 נמוך מדי',
				'justRight': '✅ מדויק',
				'tooHigh': '📈 גבוה מדי'
			};
			
			const timeAgo = new Date(vote.timestamp).toLocaleString('he-IL', {
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});
			
			// Calculate the displayed amount (base amount * party size multiplier)
			// The vote.amount is the per-person amount stored by the backend
			const partySize = vote.scenario.partySize || 1;
			const displayedAmount = applyPersonalAdjustments(vote.amount, { partySize });
			
			// Format impact display
			let impactDisplay = '';
			if (vote.impact !== undefined && vote.impact !== 0) {
				const impactText = vote.impact > 0 ? `+${formatCurrency(vote.impact)}` : formatCurrency(vote.impact);
				impactDisplay = ` • ${impactText}`;
			} else if (vote.impact === 0) {
				impactDisplay = ' • +0 ₪';
			}

			voteItem.innerHTML = `
				<div class="public-vote-left">
					<div class="public-vote-scenario">${formatScenarioDisplay(vote.scenario)}</div>
					<div class="public-vote-amount">${formatCurrency(displayedAmount)}</div>
					<div class="public-vote-time">${timeAgo}</div>
				</div>
				<div class="public-vote-right">
					<div class="public-vote-badge ${vote.voteType}">${voteText[vote.voteType]}${impactDisplay}</div>
				</div>
			`;
			
			tempContainer.appendChild(voteItem);
		});
		
		// Replace content in one operation to minimize visual disruption
		publicVotesList.innerHTML = '';
		publicVotesList.appendChild(tempContainer);
	}

	function showVoteNotification(vote) {
		const notification = document.createElement('div');
		notification.className = 'vote-notification';
		
		const voteText = {
			'tooLow': '📉 נמוך מדי',
			'justRight': '✅ מדויק',
			'tooHigh': '📈 גבוה מדי'
		};
		
		// Calculate the displayed amount (base amount * party size multiplier)
		const partySize = vote.scenario.partySize || 1;
		const displayedAmount = applyPersonalAdjustments(vote.amount, { partySize });
		
		notification.innerHTML = `
			<span class="vote-icon">${voteText[vote.voteType]}</span>
			<span>הצבעה חדשה: ${formatCurrency(displayedAmount)} - ${voteText[vote.voteType]}</span>
		`;
		
		voteNotifications.appendChild(notification);
		
		// Trigger animation
		setTimeout(() => notification.classList.add('show'), 100);
		
		// Remove after 4 seconds
		setTimeout(() => {
			notification.classList.remove('show');
			setTimeout(() => {
				if (notification.parentNode) {
					notification.parentNode.removeChild(notification);
				}
			}, 300);
		}, 4000);
	}

	// Real-time polling
	async function pollForUpdates() {
		try {
			// First, just check the vote count without updating the display
			const response = await fetch(`${API_BASE}/public-stats`);
			if (response.ok) {
				const data = await response.json();
				const currentVoteCount = data.totalVotes;
				
				// On initial load (lastVoteCount is 0) or when there are new votes
				if (lastVoteCount === 0 || currentVoteCount > lastVoteCount) {
					if (currentVoteCount > lastVoteCount && lastVoteCount > 0) {
						// Get the latest vote data for notification
						const votesResponse = await fetch(`${API_BASE}/public-votes`);
						if (votesResponse.ok) {
							const votesData = await votesResponse.json();
							if (votesData.votes && votesData.votes.length > 0) {
								// Show notification for the most recent vote
								showVoteNotification(votesData.votes[0]);
							}
						}
					}
					// Load/refresh the votes list
					await fetchPublicVotes();
				}
				
				lastVoteCount = currentVoteCount;
				updatePublicStats(data);
			}
		} catch (error) {
			console.log('API not available for polling');
		}
	}

	function startRealTimeUpdates() {
		// Initial load
		pollForUpdates();
		
		// Poll every 15 seconds (less frequent to reduce unnecessary checks)
		pollInterval = setInterval(pollForUpdates, 15000);
	}

	function stopRealTimeUpdates() {
		if (pollInterval) {
			clearInterval(pollInterval);
		}
	}

	// Count-up animation function
	function animateCountUp(element, targetValue, duration = 800) {
		// Clear any existing animation for this element
		if (element._animationTimer) {
			clearInterval(element._animationTimer);
		}
		
		const startValue = parseInt(element.textContent) || 0;
		if (startValue === targetValue) {
			return; // No animation needed if values are the same
		}
		
		const increment = (targetValue - startValue) / (duration / 16); // 60fps
		let currentValue = startValue;
		
		element._animationTimer = setInterval(() => {
			currentValue += increment;
			if ((increment > 0 && currentValue >= targetValue) || (increment < 0 && currentValue <= targetValue)) {
				currentValue = targetValue;
				clearInterval(element._animationTimer);
				element._animationTimer = null;
			}
			element.textContent = Math.floor(currentValue).toLocaleString('he-IL');
		}, 16);
	}

	async function updateVotesUI() {
		// Update the answer-specific vote counter (votesCount) - shows votes for current scenario only
		if (!votesCountEl) {
			console.error('votesCountEl element not found!');
			return;
		}
		
		if (window.currentScenario) {
			try {
				console.log('Fetching vote count for scenario:', window.currentScenario);
				const response = await fetch(`${API_BASE}/calculate`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ 
						scenario: window.currentScenario, 
						baseAmount: baseSuggestion(window.currentScenario) 
					})
				});
				
				console.log('Vote count response status:', response.status, response.statusText);
				if (response.ok) {
					const data = await response.json();
					console.log('Vote count data received:', data);
					if (data.crowdData && data.crowdData.totalVotes !== undefined) {
						console.log('Updating vote count to:', data.crowdData.totalVotes);
						animateCountUp(votesCountEl, data.crowdData.totalVotes);
						return;
					} else {
						console.log('No crowd data or totalVotes in response');
					}
				} else {
					console.error('Vote count API failed:', response.status, response.statusText);
				}
			} catch (error) {
				console.error('API not available for vote count:', error);
			}
		} else {
			console.log('No current scenario set');
		}
		
		// Fallback: show 0 if no current scenario or no API data
		console.log('Using fallback: setting vote count to 0');
		animateCountUp(votesCountEl, 0);
	}

	async function updateMainVoteCounter() {
		// Update the main vote counter (totalVotes) - shows total votes across all scenarios
		try {
			console.log('Fetching main vote counter from:', `${API_BASE}/public-stats`);
			const response = await fetch(`${API_BASE}/public-stats`);
			console.log('Main vote counter response status:', response.status, response.statusText);
			if (response.ok) {
				const data = await response.json();
				console.log('Main vote counter data received:', data);
				animateCountUp(totalVotesEl, data.totalVotes);
				return;
			} else {
				console.error('Main vote counter API failed:', response.status, response.statusText);
			}
		} catch (error) {
			console.error('API not available for main vote counter:', error);
		}
		
		// Fallback: show 0 if no API data
		console.log('Using fallback: setting main vote counter to 0');
		animateCountUp(totalVotesEl, 0);
	}

	function baseSuggestion({ eventType, closeness, venue, location }) {
		let base = 100; // reduced minimal baseline
		// Event type modifier - more realistic amounts
		switch (eventType) {
			case 'wedding': base += 200; break; // reduced from 120
			case 'bar-bat': base += 50; break; // reduced from 20
			case 'brit': base -= 10; break; // reduced from 50
			default: base -= 40; break; // reduced from 40
		}
		// Closeness - more realistic progression
		switch (closeness) {
			case 'distant': base -= 30; break;
			case 'distantFamily': base += 20; break; // reduced from 40
			case 'friend': base += 150; break; // reduced from 80
			case 'close': base += 110; break; // reduced from 160
			case 'inner': base += 250; break; // reduced from 250
		}
		// Venue - more realistic differences
		switch (venue) {
			case 'home': base -= 30; break; // more discount for home venues
			case 'garden': base += 30; break; // reduced from 40
			case 'hall': base += 70; break; // reduced from 70
			case 'restaurant': base += 40; break; // reduced from 30
		}
		// Location - more realistic differences
		switch (location) {
			case 'center': base += 40; break; // reduced from 40
			case 'north': base += 30; break; // reduced from 20
			case 'south': base += 0; break; // no change for south
			case 'jerusalem': base += 15; break; // reduced from 30
		}
		// Round to nearest 10
		return Math.max(0, Math.round(base / 10) * 10);
	}

	function applyPersonalAdjustments(amount, { partySize }) {
		// Party size adjustment - compounding 80% for each additional person
		// First person: 100%, Second: 80%, Third: 64%, Fourth+: 64% (capped at 3rd person)
		if (partySize > 1) {
			let totalMultiplier = 1; // First person at 100%
			
			// Calculate diminishing returns up to 3rd person
			for (let i = 1; i < Math.min(partySize, 3); i++) {
				totalMultiplier += Math.pow(0.80, i);
			}
			
			// For 4th person and beyond, use the same rate as 3rd person (64%)
			if (partySize > 3) {
				const thirdPersonRate = Math.pow(0.80, 2); // 64%
				const additionalPeople = partySize - 3;
				totalMultiplier += thirdPersonRate * additionalPeople;
			}
			
			amount = amount * totalMultiplier;
		}
		
		// Round to nearest 10
		return Math.max(0, Math.round(amount / 10) * 10);
	}

	async function crowdAdjustment(baseAmount, scenario) {
		try {
			const response = await fetch(`${API_BASE}/calculate`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ scenario, baseAmount })
			});
			
			if (response.ok) {
				const data = await response.json();
				return {
					amount: data.adjustedAmount,
					crowdData: data.crowdData
				};
			}
		} catch (error) {
			console.log('API not available, using local data');
		}
		
		// Fallback to local data
		const v = getVotes();
		const total = v.tooLow + v.justRight + v.tooHigh;
		if (total === 0) return { amount: baseAmount, crowdData: null };
		
		const bias = (v.tooLow - v.tooHigh) / total;
		// Use a more noticeable bias for local fallback
		const factor = 1 + bias * 0.25;
		const adjusted = Math.round(baseAmount * factor / 10) * 10;
		return { amount: Math.max(0, adjusted), crowdData: null };
	}

	function getEventMemo(eventType) {
		switch (eventType) {
			case 'wedding': return 'לכבוד: הזוג המאושר';
			case 'bar-bat': return 'לכבוד: בר/בת המצווה';
			case 'brit': return 'לכבוד: התינוק החדש';
			default: return 'לכבוד: שמחה';
		}
	}

	function updateCheque(amount, eventType, isVoteImpact = false) {
		console.log('updateCheque called with:', { amount, eventType, isVoteImpact });
		amountEl.textContent = formatCurrency(amount);
		amountWordsEl.textContent = shekelsToWords(amount);
		chequeDateEl.textContent = new Date().toLocaleDateString('he-IL');
		document.getElementById('chequeMemo').textContent = getEventMemo(eventType);
		
		// Remove any existing animation classes
		cheque.classList.remove('pop', 'vote-impact');
		
		// force reflow for animation
		void cheque.offsetWidth;
		
		// Add appropriate animation class
		if (isVoteImpact) {
			cheque.classList.add('vote-impact');
			console.log('Added vote-impact animation');
		} else {
			cheque.classList.add('pop');
		}
	}

	async function calculateAndRender(isVoteImpact = false) {
		console.log('calculateAndRender called with isVoteImpact:', isVoteImpact);
		const eventType = document.getElementById('eventType').value;
		const closeness = document.getElementById('closeness').value;
		const partySize = Number(partySizeInput.value);
		const venue = document.getElementById('venue').value;
		const location = document.getElementById('location').value;
		
		// Core scenario for crowd learning (without personal factors)
		const coreScenario = { eventType, closeness, venue, location };
		// Full scenario for personal adjustments and voting
		const fullScenario = { eventType, closeness, partySize, venue, location };
		
		// Calculate base amount from core factors only
		const base = baseSuggestion(coreScenario);
		// Get crowd-adjusted amount
		const crowdResult = await crowdAdjustment(base, coreScenario);
		console.log('Crowd adjustment result:', crowdResult);
		// Apply personal adjustments
		const finalAmount = applyPersonalAdjustments(crowdResult.amount, { partySize });
		console.log('Final amount after personal adjustments:', finalAmount);
		
		// Ensure minimum amount of 150 NIS
		const minAmount = Math.max(150, finalAmount);
		console.log('Final amount with minimum constraint:', minAmount);
		
		updateCheque(minAmount, eventType, isVoteImpact);
		voteBox.hidden = false;
		
		// Store current scenario for voting (use core scenario for vote buckets, but full scenario for display)
		window.currentScenario = coreScenario;
		window.currentFullScenario = fullScenario;
		window.currentAmount = minAmount;
		
		// Update both vote counters
		await updateVotesUI(); // Answer-specific counter
		await updateMainVoteCounter(); // Main total counter
		
		// Check if user has already voted on this scenario
		updateVoteButtonsState();
		
		console.log('calculateAndRender completed, returning:', minAmount);
		return minAmount;
	}

	// Input mirrors
	// Party size +/- button handlers
	document.getElementById('partySizeMinus').addEventListener('click', function() {
		const currentValue = parseInt(partySizeInput.value);
		if (currentValue > 1) {
			partySizeInput.value = currentValue - 1;
		}
	});

	document.getElementById('partySizePlus').addEventListener('click', function() {
		const currentValue = parseInt(partySizeInput.value);
		if (currentValue < 10) {
			partySizeInput.value = currentValue + 1;
		}
	});

	// Handle direct input changes
	partySizeInput.addEventListener('input', function () {
		const value = parseInt(this.value);
		if (value < 1) this.value = 1;
		if (value > 10) this.value = 10;
	});

	// Debounce mechanism to prevent multiple rapid calls
	let calculateTimeout = null;
	
	form.addEventListener('submit', function (e) {
		e.preventDefault();
		
		// Clear any existing timeout
		if (calculateTimeout) {
			clearTimeout(calculateTimeout);
		}
		
		// Set a new timeout
		calculateTimeout = setTimeout(() => {
			calculateAndRender();
		}, 100); // 100ms debounce
	});

	// Update vote buttons state
	function updateVoteButtonsState() {
		const buttons = document.querySelectorAll('.vote-actions .chip');
		const hasVoted = window.currentScenario ? hasVotedOnScenario(window.currentScenario) : false;
		
		buttons.forEach(btn => {
			if (hasVoted) {
				btn.disabled = true;
				btn.style.opacity = '0.6';
				btn.style.cursor = 'not-allowed';
				btn.title = 'כבר הצבעתם על התרחיש הזה';
			} else {
				btn.disabled = false;
				btn.style.opacity = '1';
				btn.style.cursor = 'pointer';
				btn.title = 'לחצו כדי להצביע';
			}
		});
		
		// Update vote stats message - DON'T recreate the votesCount element, just update the text
		const voteStats = document.querySelector('.vote-stats');
		const votesCountEl = document.getElementById('votesCount');
		if (hasVoted) {
			// Only update the text after the strong tag, preserve the votesCount element
			const textNode = voteStats.childNodes[1]; // The text node after the strong element
			if (textNode && textNode.nodeType === Node.TEXT_NODE) {
				textNode.textContent = ' הצבעות עד כה על אירוע מסוג זה • ';
			}
			// Add or update the "voted" span
			let votedSpan = voteStats.querySelector('.voted-message');
			if (!votedSpan) {
				votedSpan = document.createElement('span');
				votedSpan.className = 'voted-message';
				votedSpan.style.color = '#10b981';
				voteStats.appendChild(votedSpan);
			}
			votedSpan.textContent = 'הצבעתם על התרחיש הזה';
		} else {
			// Only update the text after the strong tag, preserve the votesCount element
			const textNode = voteStats.childNodes[1]; // The text node after the strong element
			if (textNode && textNode.nodeType === Node.TEXT_NODE) {
				textNode.textContent = ' הצבעות עד כה על אירוע מסוג זה • עזרו לנו לשפר את ההמלצות';
			}
			// Remove the "voted" span if it exists
			const votedSpan = voteStats.querySelector('.voted-message');
			if (votedSpan) {
				votedSpan.remove();
			}
		}
	}

	// Voting - use event delegation to handle dynamically shown buttons
	document.addEventListener('click', async function (e) {
		// Check if clicked element is a vote button
		if (e.target.classList.contains('chip') && e.target.hasAttribute('data-vote')) {
			const btn = e.target;
			const type = btn.getAttribute('data-vote');
			if (!type || !window.currentScenario || !window.currentAmount) return;
			
			// Check if already voted - if so, block additional votes
			if (hasVotedOnScenario(window.currentScenario)) {
				showVoteFeedback('כבר הצבעתם על התרחיש הזה', 'info');
				return;
			}

			// Visual feedback
			btn.style.transform = 'scale(0.95)';
			btn.style.background = 'linear-gradient(135deg, #0ea5e9, #22d3ee)';
			btn.style.color = 'white';
			btn.style.borderColor = '#0ea5e9';
			
			setTimeout(() => {
				btn.style.transform = '';
				btn.style.background = '';
				btn.style.color = '';
				btn.style.borderColor = '';
			}, 200);

			// Store the old amount to show the impact
			const oldAmount = window.currentAmount;
			
			// Calculate the base amount (before crowd adjustment) for voting
			const baseAmount = baseSuggestion(window.currentScenario);

			// Mark scenario as voted (only if not already voted)
			if (!hasVotedOnScenario(window.currentScenario)) {
				markScenarioAsVoted(window.currentScenario);
			}

			// Also store locally as backup
			const v = getVotes();
			if (v[type] !== undefined) {
				v[type] += 1;
				setVotes(v);
			}

			// Calculate per-person amount for voting (before party size adjustments)
			const crowdResult = await crowdAdjustment(baseAmount, window.currentScenario);
			const perPersonAmount = crowdResult.amount; // This is the per-person amount
			
			// Submit vote to API
			try {
				const response = await fetch(`${API_BASE}/vote`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						scenario: window.currentScenario,
						fullScenario: window.currentFullScenario,
						voteType: type,
						amount: perPersonAmount // Store per-person amount, not total
					})
				});

				if (response.ok) {
					console.log('Vote submitted successfully');
				} else {
					console.log('Vote submission failed:', response.status, response.statusText);
					showVoteFeedback('שגיאה בשליחת ההצבעה לשרת', 'error');
				}
			} catch (error) {
				console.log('API not available, storing locally:', error);
				showVoteFeedback('ההצבעה נשמרה מקומית', 'info');
			}

			// Recalculate with new crowd adjustment to get updated price
			const newAmount = await calculateAndRender(true); // Pass true to indicate this is a vote impact update
			
			// Calculate the impact of this vote
			const impact = newAmount - oldAmount;
			
			// Add to vote history with impact (use the final amount the user actually saw)
			console.log('Adding to vote history:', {
				scenario: window.currentScenario,
				amount: window.currentAmount,
				voteType: type,
				impact: impact
			});
			addToVoteHistory(window.currentScenario, window.currentAmount, type, impact);
			
			// Update vote counters after recalculation with a small delay to ensure API processing
			setTimeout(async () => {
				await updateVotesUI(); // Update answer-specific counter
				await updateMainVoteCounter(); // Update main total counter
			}, 500);
			
			// Show enhanced impact feedback
			console.log('Price change check:', { 
				oldAmount, 
				newAmount, 
				difference: impact,
				scenario: window.currentScenario,
				voteType: type
			});
			
			// Enhanced vote impact display
			if (impact !== 0) {
				const changeText = impact > 0 ? `+${formatCurrency(impact)}` : formatCurrency(impact);
				const impactMessage = `🎯 ההצבעה שלכם השפיעה! ${changeText} • ${formatCurrency(oldAmount)} → ${formatCurrency(newAmount)}`;
				showVoteFeedback(impactMessage, 'success');
				
				// Add visual highlight to the amount change
				highlightAmountChange(oldAmount, newAmount);
			} else {
				showVoteFeedback('✅ תודה! ההצבעה שלכם נשמרה', 'success');
			}
			
			updateVoteButtonsState();
		}
	});

	// Vote feedback function
	function showVoteFeedback(message, type) {
		const feedback = document.createElement('div');
		feedback.textContent = message;
		feedback.style.cssText = `
			position: fixed;
			top: 20px;
			right: 20px;
			padding: 12px 20px;
			border-radius: 8px;
			color: white;
			font-weight: 600;
			z-index: 1000;
			transform: translateX(100%);
			transition: transform 0.3s ease;
			${type === 'success' ? 'background: linear-gradient(135deg, #10b981, #059669);' : 'background: linear-gradient(135deg, #0ea5e9, #0284c7);'}
		`;
		
		document.body.appendChild(feedback);
		
		setTimeout(() => feedback.style.transform = 'translateX(0)', 100);
		setTimeout(() => {
			feedback.style.transform = 'translateX(100%)';
			setTimeout(() => document.body.removeChild(feedback), 300);
		}, 2000);
	}

	// Visual highlight for amount changes
	function highlightAmountChange(oldAmount, newAmount) {
		const amountEl = document.getElementById('amount');
		const amountWordsEl = document.getElementById('amountWords');
		
		// Add highlight class
		amountEl.classList.add('amount-change-highlight');
		amountWordsEl.classList.add('amount-change-highlight');
		
		// Remove highlight after animation
		setTimeout(() => {
			amountEl.classList.remove('amount-change-highlight');
			amountWordsEl.classList.remove('amount-change-highlight');
		}, 2000);
	}

	// View switching functionality
	document.querySelectorAll('.nav-btn').forEach(btn => {
		btn.addEventListener('click', function() {
			const targetView = this.getAttribute('data-view');
			console.log('Switching to view:', targetView);
			
			// Remove active class from all views and buttons
			document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
			document.querySelectorAll('.view').forEach(v => {
				v.classList.remove('active');
				console.log('Removed active from:', v.id);
			});
			
			// Add active class to clicked button and corresponding view
			this.classList.add('active');
			const targetElement = document.getElementById(targetView + '-view');
			if (targetElement) {
				targetElement.classList.add('active');
				console.log('Activated view:', targetView + '-view');
			} else {
				console.error('View element not found:', targetView + '-view');
			}
			
			// Debug: Show current state of all views
			document.querySelectorAll('.view').forEach(v => {
				console.log('View', v.id, 'has active class:', v.classList.contains('active'));
			});
			
			// Start/stop real-time updates based on view
			if (targetView === 'votes') {
				console.log('Starting real-time updates for votes');
				startRealTimeUpdates();
			} else {
				console.log('Stopping real-time updates');
				stopRealTimeUpdates();
			}
		});
	});

	// Initialize UI when DOM is ready
	function initializeApp() {
		console.log('Initializing UI...');
		console.log('totalVotesEl found:', !!totalVotesEl);
		console.log('votesCountEl found:', !!votesCountEl);
		
		updateVotesUI();
		updateMainVoteCounter();
		
		// Initialize public stats
		console.log('Initializing public stats...');
		fetchPublicStats();
		
		// Test API connection
		testAPIConnection();
	}
	
	// Run initialization when DOM is ready
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initializeApp);
	} else {
		initializeApp();
	}
	
	// Test API connection
	async function testAPIConnection() {
		try {
			console.log('Testing API connection...');
			const response = await fetch(`${API_BASE}/public-stats`);
			if (response.ok) {
				const data = await response.json();
				console.log('API connection successful:', data);
			} else {
				console.log('API connection failed:', response.status, response.statusText);
			}
		} catch (error) {
			console.log('API connection error:', error);
		}
	}
	
	// Debug function for testing API calls
	window.debugAPI = async function() {
		console.log('=== API Debug Test ===');
		console.log('API Base URL:', API_BASE);
		
		try {
			console.log('1. Testing public-stats endpoint...');
			const statsResponse = await fetch(`${API_BASE}/public-stats`);
			console.log('Stats response status:', statsResponse.status);
			const statsData = await statsResponse.json();
			console.log('Stats data:', statsData);
			
			console.log('2. Testing votes endpoint...');
			const votesResponse = await fetch(`${API_BASE}/votes`);
			console.log('Votes response status:', votesResponse.status);
			const votesData = await votesResponse.json();
			console.log('Votes data (first 3 keys):', Object.keys(votesData).slice(0, 3));
			console.log('Total vote scenarios:', Object.keys(votesData).length);
			
			console.log('3. Testing calculate endpoint with sample scenario...');
			const sampleScenario = { eventType: 'wedding', closeness: 'distant', venue: 'restaurant', location: 'center' };
			const calculateResponse = await fetch(`${API_BASE}/calculate`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ 
					scenario: sampleScenario, 
					baseAmount: 300 
				})
			});
			console.log('Calculate response status:', calculateResponse.status);
			const calculateData = await calculateResponse.json();
			console.log('Calculate data:', calculateData);
			
			console.log('=== Debug Test Complete ===');
		} catch (error) {
			console.error('Debug test failed:', error);
		}
	};
	
	// Theme switching functionality
	const themeToggle = document.getElementById('themeToggle');
	
	// Load saved theme or default to light
	const savedTheme = localStorage.getItem('theme') || 'light';
	document.documentElement.setAttribute('data-theme', savedTheme);
	updateThemeSwitch(savedTheme);
	
	// Theme toggle event listener
	themeToggle.addEventListener('change', function() {
		const newTheme = this.checked ? 'dark' : 'light';
		
		document.documentElement.setAttribute('data-theme', newTheme);
		localStorage.setItem('theme', newTheme);
		updateThemeSwitch(newTheme);
	});
	
	function updateThemeSwitch(theme) {
		themeToggle.checked = theme === 'dark';
	}
})();


