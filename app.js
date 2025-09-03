(function () {
	const form = document.getElementById('calcForm');
	const partySizeInput = document.getElementById('partySize');
	const partySizeVal = document.getElementById('partySizeVal');

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
	const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3001/api' : '/api';
	
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
		return `${scenario.eventType}-${scenario.closeness}-${scenario.partySize}-${scenario.incomeTier}-${scenario.venue}-${scenario.location}`;
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

	function addToVoteHistory(scenario, amount, voteType) {
		const history = getVoteHistory();
		const historyItem = {
			timestamp: new Date().toISOString(),
			scenario: scenario,
			amount: amount,
			voteType: voteType,
			scenarioKey: generateScenarioKey(scenario)
		};
		
		history.unshift(historyItem); // Add to beginning
		
		// Keep only last 20 items
		if (history.length > 20) {
			history.splice(20);
		}
		
		localStorage.setItem('wedding-calc-vote-history-v1', JSON.stringify(history));
		updateVoteHistoryDisplay();
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
			'garden': 'גן',
			'hall': 'אולם',
			'home': 'בית',
			'restaurant': 'מסעדה'
		};
		
		const locationNames = {
			'center': 'מרכז',
			'north': 'צפון',
			'south': 'דרום',
			'jerusalem': 'ירושלים'
		};
		
		return `${eventNames[scenario.eventType]} • ${closenessNames[scenario.closeness]} • ${scenario.partySize} אנשים • ${venueNames[scenario.venue]} • ${locationNames[scenario.location]}`;
	}

	// Public vote functions
	async function fetchPublicVotes() {
		try {
			const response = await fetch(`${API_BASE}/public-votes`);
			if (response.ok) {
				const data = await response.json();
				updatePublicVotesDisplay(data.votes);
				return data.totalVotes;
			}
		} catch (error) {
			console.log('API not available for public votes');
		}
		return 0;
	}

	async function fetchPublicStats() {
		try {
			const response = await fetch(`${API_BASE}/public-stats`);
			if (response.ok) {
				const data = await response.json();
				updatePublicStats(data);
			}
		} catch (error) {
			console.log('API not available for public stats');
		}
	}

	function updatePublicStats(stats) {
		totalVotesEl.textContent = stats.totalVotes.toLocaleString('he-IL');
		totalUsersEl.textContent = stats.totalUsers.toLocaleString('he-IL');
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
			
			voteItem.innerHTML = `
				<div class="public-vote-left">
					<div class="public-vote-scenario">${formatScenarioDisplay(vote.scenario)}</div>
					<div class="public-vote-amount">${formatCurrency(vote.amount)}</div>
					<div class="public-vote-time">${timeAgo}</div>
				</div>
				<div class="public-vote-right">
					<div class="public-vote-badge ${vote.voteType}">${voteText[vote.voteType]}</div>
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
		
		notification.innerHTML = `
			<span class="vote-icon">${voteText[vote.voteType]}</span>
			<span>הצבעה חדשה: ${formatCurrency(vote.amount)} - ${voteText[vote.voteType]}</span>
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
						const newVotes = currentVoteCount - lastVoteCount;
						// Show notification for new votes
						if (newVotes > 0) {
							showVoteNotification({
								voteType: 'justRight', // Default for demo
								amount: 500 // Default for demo
							});
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

	function updateVotesUI() {
		const v = getVotes();
		const total = v.tooLow + v.justRight + v.tooHigh;
		votesCountEl.textContent = total.toString();
	}

	function baseSuggestion({ eventType, closeness, partySize, incomeTier, venue, location }) {
		let base = 200; // minimal baseline
		// Event type modifier
		switch (eventType) {
			case 'wedding': base += 150; break;
			case 'bar-bat': base += 80; break;
			case 'brit': base += 50; break;
			default: base += 40; break;
		}
		// Closeness
		switch (closeness) {
			case 'distant': base += 0; break;
			case 'distantFamily': base += 40; break;
			case 'friend': base += 80; break;
			case 'close': base += 160; break;
			case 'inner': base += 250; break;
		}
		// Income tier
		switch (incomeTier) {
			case 'low': base *= 0.85; break;
			case 'mid': base *= 1.0; break;
			case 'high': base *= 1.08; break;
			case 'veryHigh': base *= 1.15; break;
			case 'premium': base *= 1.25; break;
		}
		// Venue
		switch (venue) {
			case 'garden': base += 40; break;
			case 'hall': base += 70; break;
			case 'restaurant': base += 30; break;
			case 'home': base -= 40; break;
		}
		// Location
		switch (location) {
			case 'center': base += 100; break; // higher for center
			case 'north': base += 20; break; // slightly higher for north
			case 'south': base += 0; break; // no change for south
			case 'jerusalem': base += 30; break; // higher for Jerusalem
		}
		// Party size - first person is full amount, each additional person is 75%
		if (partySize === 1) {
			// Just one person, no change
		} else {
			// Add 75% of base for each additional person
			const additionalPeople = partySize - 1;
			base += (base * 0.75 * additionalPeople);
		}
		// Round to nearest 10
		return Math.max(0, Math.round(base / 10) * 10);
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
		const factor = 1 + bias * 0.12;
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

	function updateCheque(amount, eventType) {
		amountEl.textContent = formatCurrency(amount);
		amountWordsEl.textContent = shekelsToWords(amount);
		chequeDateEl.textContent = new Date().toLocaleDateString('he-IL');
		document.getElementById('chequeMemo').textContent = getEventMemo(eventType);
		cheque.classList.remove('pop');
		// force reflow for animation
		void cheque.offsetWidth;
		cheque.classList.add('pop');
	}

	async function calculateAndRender() {
		const eventType = document.getElementById('eventType').value;
		const closeness = document.getElementById('closeness').value;
		const partySize = Number(partySizeInput.value);
		const incomeTier = document.getElementById('incomeTier').value;
		const venue = document.getElementById('venue').value;
		const location = document.getElementById('location').value;
		const scenario = { eventType, closeness, partySize, incomeTier, venue, location };
		const base = baseSuggestion(scenario);
		const result = await crowdAdjustment(base, scenario);
		
		updateCheque(result.amount, eventType);
		voteBox.hidden = false;
		updateVotesUI();
		
		// Store current scenario for voting
		window.currentScenario = scenario;
		window.currentAmount = result.amount;
		
		// Check if user has already voted on this scenario
		updateVoteButtonsState();
		
		return result.amount;
	}

	// Input mirrors
	partySizeInput.addEventListener('input', function () {
		partySizeVal.textContent = partySizeInput.value;
	});

	form.addEventListener('submit', function (e) {
		e.preventDefault();
		calculateAndRender();
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
				btn.title = 'כבר הצבעתם על התוצאה הזו';
			} else {
				btn.disabled = false;
				btn.style.opacity = '1';
				btn.style.cursor = 'pointer';
				btn.title = '';
			}
		});
		
		// Update vote stats message
		const voteStats = document.querySelector('.vote-stats');
		if (hasVoted) {
			voteStats.innerHTML = '<strong id="votesCount">' + document.getElementById('votesCount').textContent + '</strong> הצבעות עד כה • <span style="color: #10b981;">הצבעתם על התוצאה הזו</span>';
		} else {
			voteStats.innerHTML = '<strong id="votesCount">' + document.getElementById('votesCount').textContent + '</strong> הצבעות עד כה • עזרו לנו לשפר את ההמלצות';
		}
	}

	// Voting
	document.querySelectorAll('.vote-actions .chip').forEach(function (btn) {
		btn.addEventListener('click', async function () {
			const type = btn.getAttribute('data-vote');
			if (!type || !window.currentScenario || !window.currentAmount) return;
			
			// Check if already voted
			if (hasVotedOnScenario(window.currentScenario)) {
				showVoteFeedback('כבר הצבעתם על התוצאה הזו', 'info');
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

			// Submit vote to API
			try {
				const response = await fetch(`${API_BASE}/vote`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						scenario: window.currentScenario,
						voteType: type,
						amount: window.currentAmount
					})
				});

				if (response.ok) {
					console.log('Vote submitted successfully');
					// Show success feedback
					showVoteFeedback('תודה! ההצבעה נשמרה', 'success');
				}
			} catch (error) {
				console.log('API not available, storing locally');
				showVoteFeedback('ההצבעה נשמרה מקומית', 'info');
			}

			// Mark scenario as voted
			markScenarioAsVoted(window.currentScenario);

			// Add to vote history
			addToVoteHistory(window.currentScenario, window.currentAmount, type);

			// Also store locally as backup
			const v = getVotes();
			if (v[type] !== undefined) {
				v[type] += 1;
				setVotes(v);
			}

			updateVotesUI();
			updateVoteButtonsState();
			// Recalculate with new crowd adjustment
			await calculateAndRender();
		});
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

	// Initialize UI mirrors
	partySizeVal.textContent = partySizeInput.value;
	updateVotesUI();
	
	// Initialize public stats
	fetchPublicStats();
})();


