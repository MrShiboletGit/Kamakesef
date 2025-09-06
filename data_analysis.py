import json

# Sample data from your query
data = [
    {"scenario_key": "wedding-friend-hall-center", "too_low": 18, "just_right": 14, "too_high": 25, "total_votes": 57, "avg_amount": "471"},
    {"scenario_key": "wedding-inner-hall-center", "too_low": 20, "just_right": 15, "too_high": 15, "total_votes": 50, "avg_amount": "637"},
    {"scenario_key": "wedding-distant-hall-center", "too_low": 6, "just_right": 13, "too_high": 23, "total_votes": 42, "avg_amount": "471"},
    {"scenario_key": "wedding-close-hall-center", "too_low": 9, "just_right": 10, "too_high": 16, "total_votes": 35, "avg_amount": "477"},
    {"scenario_key": "wedding-inner-home-center", "too_low": 6, "just_right": 14, "too_high": 14, "total_votes": 34, "avg_amount": "636"},
    {"scenario_key": "bar-bat-friend-hall-center", "too_low": 1, "just_right": 5, "too_high": 23, "total_votes": 29, "avg_amount": "532"},
    {"scenario_key": "wedding-friend-garden-center", "too_low": 13, "just_right": 4, "too_high": 7, "total_votes": 24, "avg_amount": "748"},
    {"scenario_key": "bar-bat-friend-home-center", "too_low": 1, "just_right": 1, "too_high": 20, "total_votes": 22, "avg_amount": "364"},
    {"scenario_key": "bar-bat-distant-hall-center", "too_low": 4, "just_right": 0, "too_high": 18, "total_votes": 22, "avg_amount": "340"},
    {"scenario_key": "brit-inner-hall-center", "too_low": 0, "just_right": 1, "too_high": 18, "total_votes": 19, "avg_amount": "531"},
    {"scenario_key": "wedding-distantFamily-hall-center", "too_low": 3, "just_right": 6, "too_high": 8, "total_votes": 17, "avg_amount": "402"},
    {"scenario_key": "wedding-distant-garden-center", "too_low": 2, "just_right": 6, "too_high": 8, "total_votes": 16, "avg_amount": "472"},
    {"scenario_key": "wedding-inner-garden-center", "too_low": 8, "just_right": 3, "too_high": 5, "total_votes": 16, "avg_amount": "548"},
    {"scenario_key": "bar-bat-inner-hall-center", "too_low": 1, "just_right": 3, "too_high": 11, "total_votes": 15, "avg_amount": "521"},
    {"scenario_key": "wedding-close-garden-center", "too_low": 2, "just_right": 4, "too_high": 8, "total_votes": 14, "avg_amount": "476"},
    {"scenario_key": "bar-bat-close-home-center", "too_low": 2, "just_right": 2, "too_high": 10, "total_votes": 14, "avg_amount": "365"},
    {"scenario_key": "other-inner-hall-jerusalem", "too_low": 0, "just_right": 0, "too_high": 13, "total_votes": 13, "avg_amount": "432"},
    {"scenario_key": "bar-bat-close-hall-center", "too_low": 0, "just_right": 3, "too_high": 10, "total_votes": 13, "avg_amount": "398"},
    {"scenario_key": "wedding-friend-hall-north", "too_low": 6, "just_right": 2, "too_high": 5, "total_votes": 13, "avg_amount": "570"},
    {"scenario_key": "other-inner-home-jerusalem", "too_low": 0, "just_right": 0, "too_high": 11, "total_votes": 11, "avg_amount": "380"},
    {"scenario_key": "other-inner-home-center", "too_low": 0, "just_right": 0, "too_high": 11, "total_votes": 11, "avg_amount": "631"},
    {"scenario_key": "bar-bat-inner-home-center", "too_low": 0, "just_right": 1, "too_high": 9, "total_votes": 10, "avg_amount": "501"},
    {"scenario_key": "wedding-inner-hall-north", "too_low": 6, "just_right": 1, "too_high": 3, "total_votes": 10, "avg_amount": "454"},
    {"scenario_key": "other-inner-hall-center", "too_low": 0, "just_right": 0, "too_high": 10, "total_votes": 10, "avg_amount": "458"}
]

# Analyze patterns
def analyze_patterns(data):
    print("=== EVENT TYPE ANALYSIS ===")
    event_types = {}
    for item in data:
        event = item['scenario_key'].split('-')[0]
        if event not in event_types:
            event_types[event] = {'too_low': 0, 'just_right': 0, 'too_high': 0, 'total': 0, 'count': 0}
        
        event_types[event]['too_low'] += item['too_low']
        event_types[event]['just_right'] += item['just_right']
        event_types[event]['too_high'] += item['too_high']
        event_types[event]['total'] += item['total_votes']
        event_types[event]['count'] += 1
    
    for event, stats in event_types.items():
        if stats['total'] > 0:
            too_low_pct = (stats['too_low'] / stats['total']) * 100
            just_right_pct = (stats['just_right'] / stats['total']) * 100
            too_high_pct = (stats['too_high'] / stats['total']) * 100
            print(f"{event}: {stats['total']} votes | Too Low: {too_low_pct:.1f}% | Just Right: {just_right_pct:.1f}% | Too High: {too_high_pct:.1f}%")
    
    print("\n=== VENUE ANALYSIS ===")
    venues = {}
    for item in data:
        parts = item['scenario_key'].split('-')
        if len(parts) >= 3:
            venue = parts[2]
            if venue not in venues:
                venues[venue] = {'too_low': 0, 'just_right': 0, 'too_high': 0, 'total': 0, 'count': 0}
            
            venues[venue]['too_low'] += item['too_low']
            venues[venue]['just_right'] += item['just_right']
            venues[venue]['too_high'] += item['too_high']
            venues[venue]['total'] += item['total_votes']
            venues[venue]['count'] += 1
    
    for venue, stats in venues.items():
        if stats['total'] > 0:
            too_low_pct = (stats['too_low'] / stats['total']) * 100
            just_right_pct = (stats['just_right'] / stats['total']) * 100
            too_high_pct = (stats['too_high'] / stats['total']) * 100
            print(f"{venue}: {stats['total']} votes | Too Low: {too_low_pct:.1f}% | Just Right: {just_right_pct:.1f}% | Too High: {too_high_pct:.1f}%")
    
    print("\n=== CLOSENESS ANALYSIS ===")
    closeness = {}
    for item in data:
        parts = item['scenario_key'].split('-')
        if len(parts) >= 2:
            close = parts[1]
            if close not in closeness:
                closeness[close] = {'too_low': 0, 'just_right': 0, 'too_high': 0, 'total': 0, 'count': 0}
            
            closeness[close]['too_low'] += item['too_low']
            closeness[close]['just_right'] += item['just_right']
            closeness[close]['too_high'] += item['too_high']
            closeness[close]['total'] += item['total_votes']
            closeness[close]['count'] += 1
    
    for close, stats in closeness.items():
        if stats['total'] > 0:
            too_low_pct = (stats['too_low'] / stats['total']) * 100
            just_right_pct = (stats['just_right'] / stats['total']) * 100
            too_high_pct = (stats['too_high'] / stats['total']) * 100
            print(f"{close}: {stats['total']} votes | Too Low: {too_low_pct:.1f}% | Just Right: {just_right_pct:.1f}% | Too High: {too_high_pct:.1f}%")

analyze_patterns(data)
