# Vangrd: cloud Travian Legends bot

Build villages, run farm lists, train troops, and coordinate defense from one web dashboard.
[Vangrd](https://vangrd.bot) runs your configured automation in the cloud while your computer is off.

**[Open the demo](https://vangrd.bot/demo)** · **[Create an account](https://vangrd.bot/register)** · [Pricing](https://vangrd.bot/pricing) · [Guides](https://vangrd.bot/guides) · [Changelog](CHANGELOG.md)

[![Vangrd dashboard with villages, automation controls, and an incoming attack alert](https://vangrd.bot/guides/img/getting-started-dashboard.webp)](https://vangrd.bot/demo)

*An existing guide screenshot with demo data. The interactive demo uses sample accounts and does not send game actions.*

## What you can automate

You choose the plans, targets, limits, and work periods. Vangrd handles the configured actions across your villages.

| Capability | What Vangrd does | Guide and interface evidence |
|---|---|---|
| Building | Follows village build plans, reuses templates, and waits for resources or queue space. | [Building guide and screenshots](https://vangrd.bot/guides/building-queue-automation) |
| Farming | Starts farm lists, clears oases, and tunes troops with the farm optimizer. | [Farm lists](https://vangrd.bot/guides/travian-farm-bot) · [Optimizer](https://vangrd.bot/guides/farm-optimizer) |
| Troops | Fills configured training queues and supports troop healing. | [Training guide and screenshots](https://vangrd.bot/guides/troop-training-automation) |
| Resources | Runs enabled NPC trades and moves resources between linked villages within your limits. | [Resource and supply guide](https://vangrd.bot/guides/travian-npc-bot) |
| Settlement | Prepares settlers and sends them to coordinates you choose. | [Expansion guide and screenshots](https://vangrd.bot/guides/auto-expansion) |
| Defense | Monitors incoming attacks and runs configured village responses. | [Defense guide and screenshots](https://vangrd.bot/guides/automated-defense) |
| Attack planning | Plans waves by send time or arrival time and reports failed or missed plans. | [Attack planner guide](https://vangrd.bot/guides/attack-planner) |
| Player tracking | Records player history and finds nearby inactive villages. | [Tracking guide and screenshots](https://vangrd.bot/guides/player-tracking) |
| Custom workflows | Chains actions, conditions, and delays with a configured error policy. | [Workflow guide](https://vangrd.bot/guides/custom-automation-workflows) |
| Account control | Applies work periods and shows jobs, waiting reasons, and failures in Status. | [Schedules](https://vangrd.bot/guides/schedules-and-safety) · [Status guide](https://vangrd.bot/guides/travian-bot-status) |

The guides explain each setting and show the interface.
See the [full feature overview](https://vangrd.bot/features) for related automation.

## Workflows across villages

**Prepare a new village.** Pick settlement coordinates and enable the settler controls.
Vangrd checks prerequisites, prepares settlers, and checks the target before dispatch.
Occupied tiles, missing settlement slots, or insufficient resources can block the send.
[Configure expansion](https://vangrd.bot/guides/auto-expansion).

**Fund a growing village.** Link feeder villages to the destination and set reserves and shipment limits.
Vangrd checks donor resources, destination needs, and available merchants before sending.
[Configure supply links](https://vangrd.bot/guides/travian-npc-bot).

**Respond to an incoming attack.** Set each village's response rules and notifications.
Vangrd scans incoming attacks and uses those rules to choose a response.
Detection needs a working game session. Threat estimates cannot reveal hidden troops with certainty.
[Configure defense](https://vangrd.bot/guides/automated-defense).

## Cloud operation

Use Vangrd through a browser on your desktop, laptop, or phone. You do not need to keep a local bot running.
Agents run on Vangrd's infrastructure and follow your configured work and sleep periods.
[Cloud operation](https://vangrd.bot/cloud-travian-bot) explains the setup.

Vangrd saves job timing and attempts browser recovery with retry limits.
The [Status page guide](https://vangrd.bot/guides/travian-bot-status) explains waiting reasons and failure details.

## Recent maintenance

<!-- changelog-summary:start -->
Latest authored entry: **2026-10-08 23:13**. [211 dated entries](CHANGELOG.md) since 2026-02-25.

| Date | Product update |
|---|---|
| 2026-10-08 | [Browser Language and Time Zone Match Your Agent](CHANGELOG.md#entry-202610082313-2bead3d8236e) |
| 2026-10-08 | [Alliance Intel and Orders](CHANGELOG.md#entry-202610081623-cc9c52ae6fe4) |
| 2026-10-08 | [Shared Account Controls](CHANGELOG.md#entry-202610081508-7a5f4dc17866) |
| 2026-10-08 | [Recall Selected Troops](CHANGELOG.md#entry-202610081020-212f5727d1d1) |
| 2026-10-08 | [Alliance Command](CHANGELOG.md#entry-202610080901-a7db01e1916d) |
<!-- changelog-summary:end -->

The [complete history](CHANGELOG.md) includes feature additions, compatibility fixes, and recovery improvements.
The [website changelog](https://vangrd.bot/changelog) is the canonical product history.

## Start with one workflow

1. [Create your Vangrd account](https://vangrd.bot/register).
2. Follow the [setup guide](https://vangrd.bot/guides/getting-started) to connect your Travian account and agent.
3. Choose a build plan or farm list, then check its results in Status before enabling more automation.

Check [current pricing](https://vangrd.bot/pricing) for agent plans and linked gameworld costs.
Game features can have their own requirements and Gold costs.

Vangrd is an unofficial service for Travian Legends. Travian Games does not endorse Vangrd.
[Travian's rules prohibit automation](https://support.travian.com/en/articles/118-game-rules-faq), and its use can lead to penalties.

## About this repository

This is Vangrd's public product introduction and documentation repository. The application source remains private.
The [website guides](https://vangrd.bot/guides) are canonical. The older [guide snapshots](guides/) here can lag behind the interface.
[Changelog maintenance](MAINTAINING.md) explains how this repository refreshes its release notes.

Product overview reviewed on 2026-10-11.
