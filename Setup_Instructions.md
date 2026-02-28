# Cat Fact Incident Automation - Flow Setup Instructions

## Overview
This flow runs when a new incident is created, fetches a cat fact from catfact.ninja, adds it as a priority-tagged comment, assigns the incident to a random ITIL user, and roasts them in the work notes.

## Flow Configuration

### 1. Create a New Flow
- Go to **Flow Designer** (sn_fd_flow_designer)
- Click **New** > **Flow**
- Name: `Cat Fact Incident Automation`
- Table: `Incident [incident]`
- Run: `After` `Record is created`

### 2. Action 1: REST API - Get Cat Fact

**Action Type:** REST

**Configuration:**
- **Connection Alias:** Create new or use existing REST connection
- **Base URL:** `https://catfact.ninja`
- **Resource Path:** `/fact`
- **HTTP Method:** GET

**Headers:**
| Header | Value |
|--------|-------|
| Accept | application/json |

**Output Variables:**
- Name: `cat_fact`
- Source: Response Body
- Path: `fact`

### 3. Action 2: Run Script - Get Priority Modifier

**Action Type:** Run Script

**Script:**
```javascript
(function() {
  var priority = fd_data.trigger.current.priority;
  var modifiers = {
    '1': 'P1 CRITICAL ALERT',
    '2': 'P2 HIGH PRIORITY',
    '3': 'P3 MODERATE',
    '4': 'P4 LOW',
    '5': 'P5 PLANNING'
  };
  return modifiers[priority] || 'INCIDENT ALERT';
})();
```

**Output Variable:** `priority_modifier`

### 4. Action 3: Update Record - Add Cat Fact Comment

**Action Type:** Update Record

**Configuration:**
- **Table:** Incident
- **Record:** `Trigger - Record Created` (the current incident)

**Field Values:**
| Field | Value |
|-------|-------|
| Comments | `[${Get Priority Modifier.priority_modifier}] CAT FACT: ${Get Cat Fact.cat_fact}` |

### 5. Action 4: Run Script - Get Random ITIL User

**Action Type:** Run Script

**Script:**
```javascript
(function() {
  var users = [];
  var gr = new GlideRecord('sys_user');
  gr.addActiveQuery();
  gr.addQuery('roles', 'CONTAINS', 'itil');
  gr.query();

  while (gr.next()) {
    users.push({
      sys_id: gr.getUniqueValue(),
      name: gr.getDisplayValue('name'),
      user_name: gr.getValue('user_name')
    });
  }

  if (users.length === 0) {
    return { sys_id: null, name: null };
  }

  var randomIndex = Math.floor(Math.random() * users.length);
  return users[randomIndex];
})();
```

**Output Variables:**
- `assigned_user_id` (object property: `sys_id`)
- `assigned_user_name` (object property: `name`)

### 6. Action 5: Run Script - Generate Roast

**Action Type:** Run Script

**Script:**
```javascript
(function() {
  var roasts = [
    'Good luck with this one! Your debugging skills are about to be tested harder than a cat\'s patience at the vet.',
    'Hope you like puzzles, because this incident is more tangled than a ball of yarn in a kitten\'s paws.',
    'Assigned to someone with the luck of a black cat crossing their path. You\'ll need it!',
    'This one\'s yours now! May your troubleshooting be faster than a cat\'s reflexes when they hear a can opener.',
    'Congratulations! You\'ve won the privilege of solving this mystery. It\'s more confusing than why cats love boxes so much.',
    'Assigned to you because we believe in second chances... and third chances... and however many it takes you to fix this.',
    'Hope you\'re well-rested, because this incident is going to keep you busier than a cat trying to bury a mistake on a marble floor.',
    'You\'ve been chosen! Your reward is this delightful ticket that will haunt you like a cat\'s judgmental stare at 5 AM.',
    'This incident just got personal. It\'s now your problem, like a cat bringing you a \'gift\' at 3 AM.',
    'Welcome to the party! This incident is about as welcome as a hairball on a white carpet, but it\'s yours now!',
    'Assigned to someone whose troubleshooting skills are legendary... in their own mind. Let\'s see if reality matches!',
    'This one\'s all yours! May the odds be ever in your favor (they won\'t be, but we like to stay positive).',
    'Congratulations on your new best friend - this incident! It will follow you around like a cat demanding dinner at 4 PM.',
    'You\'ve been selected as the chosen one to resolve this. Don\'t let it go to your head... or let it destroy your sanity.',
    'This incident is now your responsibility, like a cat that decided your keyboard is the perfect place to nap during a demo.'
  ];
  var randomIndex = Math.floor(Math.random() * roasts.length);
  return roasts[randomIndex];
})();
```

**Output Variable:** `roast_message`

### 7. Action 6: Update Record - Assign and Add Roast (Conditional)

**Action Type:** Update Record
**Condition:** `Get Random ITIL User.assigned_user_id is not empty`

**Configuration:**
- **Table:** Incident
- **Record:** `Trigger - Record Created`

**Field Values:**
| Field | Value |
|-------|-------|
| Assigned to | `${Get Random ITIL User.assigned_user_id}` |
| Work notes | `ASSIGNMENT ROAST for ${Get Random ITIL User.assigned_user_name}: ${Generate Roast.roast_message}` |

### 8. Action 7: Update Record - No ITIL User Fallback (Conditional)

**Action Type:** Update Record
**Condition:** `Get Random ITIL User.assigned_user_id is empty`

**Configuration:**
- **Table:** Incident
- **Record:** `Trigger - Record Created`

**Field Values:**
| Field | Value |
|-------|-------|
| Work notes | `No ITIL users found for random assignment. The cat facts remain, but the roast must wait.` |

## Flow Diagram Summary

```
[Trigger: Incident Created]
        |
        v
[REST: Get Cat Fact from catfact.ninja]
        |
        v
[Script: Get Priority Modifier]
        |
        v
[Update: Add Cat Fact Comment]
        |
        v
[Script: Get Random ITIL User]
        |
        +--(If user found)--> [Script: Generate Roast] --> [Update: Assign & Add Roast]
        |
        +--(If no user)--> [Update: Add Fallback Work Note]
```

## Testing

1. Create a new incident with different priorities (1-5)
2. Verify:
   - Cat fact appears in comments with priority tag (e.g., `[P1 CRITICAL ALERT] CAT FACT: ...`)
   - Incident is assigned to a random ITIL user
   - Work notes contain the roast message

## Troubleshooting

### REST API Connection Issues
- Ensure your ServiceNow instance can reach `https://catfact.ninja`
- Check if a Connection Alias is needed for external REST calls

### No ITIL Users Found
- Verify there are active users with the `itil` role
- Check that the role name is exactly `itil` (case-sensitive in some instances)

## Optional Enhancements

1. **Add error handling** for the REST call with a fallback cat fact
2. **Filter ITIL users** by availability (check if they're on shift)
3. **Add email notifications** to the roasted user
4. **Track roast history** so the same user doesn't get roasted too frequently
