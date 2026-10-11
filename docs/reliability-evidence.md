# Vangrd reliability evidence

Vangrd restores saved work after a restart, retries eligible preparation, and reports work that cannot continue.
This page records our controlled checks and separates them from measured game outcomes.

## Controlled checks on October 11, 2026

We reviewed the version serving customers on the test date and ran its targeted regression tests.
The tests use controlled failures and simulated game conditions. They are Vangrd's own checks.

| Scenario | Expected behavior | Observed test result |
| --- | --- | --- |
| Restart with a saved attack plan | Recover eligible preparation. Fail overdue plans rather than send without a timing limit. | Passed. Saved plans recovered. Overdue plans failed. |
| Pause or sleep with a known deadline | Preserve timed attack plans and known defense responses. | Passed. Ordinary stops did not cancel these deadlines. |
| Kill switch before an action | Block automation, including timed military actions. | Passed. The checked actions were blocked. |
| Attack preparation fails | Try another available agent within the preparation deadline and retry limit. | Passed. Retry and stop conditions held. |
| Final send has an unknown outcome | Stop automatic failover to avoid another uncertain send. | Passed. Automatic failover stopped. |
| One independent village task fails | Let other village work continue. | Passed. Other village work continued. |
| Dashboard reconnects after pending settings edits | Refresh account state and recover supported pending edits. | Passed. Reconnection and edit recovery checks held. |

These results establish behavior under the tested conditions. They do not establish uninterrupted sends through every deployment or outage.
A shared game connection failure can affect all villages. The [execution controls](execution-controls.md) explain pause and stop behavior.

If a final send has an unknown outcome, check the game before repeating it.

## Recorded timing and measurement limits

The [official reliability page](https://vangrd.bot/reliability) publishes our October 10 to 11, 2026 timing sample and method.
It covers one account, 19 observed attempts, and 18 successful responses.
Timing measures when the client observed the response after the planned send time.
It does not confirm outgoing troop movements, game acceptance, or arrival precision.

This single-account sample does not establish fleet-wide reliability.

## Evidence for your own account

The [Status guide](https://vangrd.bot/guides/travian-bot-status) shows how to inspect jobs, waiting reasons, and failed runs.
Use the [demo](https://vangrd.bot/demo) to inspect the interface with synthetic data.
The [product changelog](../CHANGELOG.md) records dated maintenance. Its entries are product notes, not reliability measurements.

[Back to the product overview](../README.md).
