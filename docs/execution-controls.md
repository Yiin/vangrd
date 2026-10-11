# Vangrd execution controls

Pause stops routine automation. Timed attack plans and known defense responses can continue through pause, sleep, and a billing lapse.
The kill switch blocks new automation actions, including timed attacks and dodges. Support manages this control.

These separate controls let you stop routine work without dropping a planned attack or an already detected defense deadline.
No control automatically recalls troops or merchants already sent to the game.

## What each state permits

This table describes automatic work. A timed attack is an Attack Planner plan.
A known defense response acts on an incoming attack Vangrd has already detected.
Routine work includes ordinary queued troop commands. Moving troops does not give a command the timed-plan exception.

| Account or agent state | Routine automation | Timed attacks and known defense |
| --- | --- | --- |
| Normal | Runs when due and eligible. | Attempts plans and enabled responses at their deadlines. |
| Account paused | Pending jobs wait. Active routine attempts stop. | Continues unless canceled or blocked. |
| Agent asleep or on a schedule break | New jobs wait. Active work can finish. | Continues with a working game connection. |
| Billing lapsed | Affected agent access loses eligibility. | Billing lapse alone does not cancel these actions. |
| Game connection disconnected | Recovery can resume eligible work. Actions can fail. | Recovery can run. Attack preparation can retry. Defense must act before impact. |
| Kill switch active | Blocks new actions. | Blocks sends and responses. Imminent plans and responses can fail. |

Every game action needs valid credentials and a working game connection.
An expired agent connection can prevent a send even when billing rules permit the attempt.
New incoming attacks still need detection. The defense exception does not provide continuous scanning while routine work is paused.

Closing the dashboard does not pause cloud automation. A dashboard disconnection differs from a game connection failure.
Actions you explicitly request can have separate controls. Pause is not a blanket block on new user commands.

## Stop the intended work

- To stop routine automation, pause the account. Review its state in **Status**.
- To stop one pending timed attack, cancel that plan in **Attack Planner** before its final send.
- To request the account kill switch, contact support through the [in-app inbox](data-and-access.md#get-help-with-a-run-or-account).
  Review imminent plans with support before resuming. Blocked plans can fail.

Cancellation cannot undo a request already sent to the game.
If a send outcome is unknown, check the game before you send again.

See [Schedules](https://vangrd.bot/guides/schedules-and-safety) for work periods and [Status](https://vangrd.bot/guides/travian-bot-status) for waiting reasons.
The [Attack Planner guide](https://vangrd.bot/guides/attack-planner) explains plans and timing settings.
Our [reliability evidence](reliability-evidence.md) records the checks behind these controls.

Behavior reviewed on 2026-10-11. [Back to the product overview](../README.md).
