Axion initial spec.

> OK, so for the new product we will need to start with a new code base, new folders, many things to try to disentangle us from some of this legacy. I want to keep the legacy separate so we can refer to it later if need be. We need to move away from the old "spice" "spice-dashboard" folders and naming and start again by copying the things that are needed.

So I expect new vercel projects, new supabase projects, new mobile projects, new GitHub project etc will be needed. But you decide what's best, but I do not want to scrimp on this activity.


I think, for the most part, it can be significantly based on the previous app, much great work was done on that app. and I can tell you what will be different. Much of it (signing  up, managing a wallet etc) will be the same. Some things can be removed. But I want to keep the old app for reference. If you can tell me the main pages  that made up the old app, I can tell you the differences. Then we can work on the new features. 


App.zpc.finance
Text "Each colony is a geographical area running the Axion Mond/UBI system. Join one or create your own."
We will no longer need the Earth/Mars differentiator.
But otherwise this page is great. All the citizen signing up features etc are great.

App.zpc.finance/colony

Dashboard-
Overall look is great.
We can remove the "MCC" functionality . in this new world, for now, municipal functions and utilities will be carried out by the municipal authorities.
So the "MCC bill" can be removed. All of the MCC CEO/CFO voting etc is no longer relevant.
MCC admin can be removed.
I think we should keep the G-Token ID, and voting functionality. I think municipalities might like this.
The "company" functionality can probably go in the sense that citizens will not own the "cottage industry" companies in the sense that the old spice app did. 
Assets and Obligations can be removed.
Recent Transactions can be "Recent Mond Transactions" and can stay.
There will need to be "Transfer to/from bank account" where Mond would be transferred to a bank account in $ , or vice versa.
My profile page - is great.

Dependants- I cannot see the dependents page but because minors will be getting some UBI this will be important

the spice.zpc.finance page is good and can be resurrected as axion.zpc.finance

the mobile app can stay similar for now, subject to modifications as above. It will interact with the stores which are priced in $.

the Fisc page looks good, can stay as is for now but will be modified substantially as we build the new product together.

The Mall
Should stay, but will no longer be part of the axion system. For the purposes of this prototype, What we need to do is to generate a significant number of web stores, maybe 30-40, which Represent stores in a typical county, like midwestville So I can imagine a couple of gas stations, general stores, restaurants, a "Zamazon" online Store, a hospital, Dome Hepot, And similar things. And stores need to be populated with many representative products (perhaps 100 in the case of "Malwart", and "Zamazon" priced in dollars. As I said, these will be outside the Axion system, but users of this prototype will be able to navigate to them via the Mall, and conduct transactions with them. Most of them will be "Mond-in" -e.g. signed up, and some will be "Mond-out". We should not hold back on the automatic creation of these stores and products - we need many - and each should have its own webpage with products.

The core elements of the new Axion system is as follows

The Mond cryptocurrency, whch uses the same BASE/BAse Sepolia tech as before. Mond is 1:1 exchangeable with USD (or local currency).

Mond Pay app (which can use the same QR code/NFC tech we used before) - we can pretend this works like Apple Pay. The Mond Pay app can work (As before) interacting with the Mall stores, which are proced in USD.

The Fisc, which sits centrally 
communicates with all the Mond Pay apps held by citizens, and their crypto wallets
calculates MAC gross on transactions according to the MAC formula.
Batches up the MAC (plus a transaction summary) and requests the MAC from Vendors, tracks payment. 
Manages the central store of USD (or buys US treasuries / PAXG to maintain value) 
Calculates and pays UBI via a citizens Mond Pay app (I want a better name for UBI - but UBI for now)
