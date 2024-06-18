# Changelog

## 1.7.4

### Changed

-   Remove `shield` button.
-   Remove `encryptedTransfer` button.
-   Rename `anonymity revokers` to `identity disclosure authorities`.

## 1.7.3

### Fixed

-   An issue reported on Windows where the Ledger connectivity state was faulty, preventing users from signing transactions.

## 1.7.2

### Fixed

-   Allow validators to change restaking preference while below minimum threshold

## 1.7.1

### Changed

-   Reworded to remove usage of `grace period` term.

## 1.7.0

### Changed

-   Baker/baking renamed to validator/validation in UI.
-   Default name for key file is now validator-credentials.json.
-   Baker/delegator icons have been replaced.
-   Finalization commission rate is now only displayed when interacting with the ledger.

### Added

-   labels for renamed values when interacting with the ledger.

## 1.6.0

### Added

-   Support for block energy limit chain update.
-   Support for finalization committee parameters chain update.
-   Support for minimum block time chain update.
-   Support for timeout parameters chain update.
-   Support for the new version of the GAS rewards update.

### Changed

-   Election difficulty authorization is displayed as `Consensus`.
-   Election difficulty update is only shown when protocol is below version 6.

### Fixed

-   Fixed an issue where single quotes in the password would crash the wallet, by not allowing single quotes in the password.

## 1.5.0

### Added

-   Support for Ledger Nano S Plus devices.

### Fixed

-   Fixed an issue on macOS that prevented automatic updates from installing after successfully being downloaded and verified.

## 1.4.2

### Fixed

-   Fixed an issue on macOS where an error popup would show after closing the main application window and opening it again.
-   Fixed an issue on macOS where identity creation was not possible after closing the main application window and opening it again.

## 1.4.1

### Added

-   Link to delegation documentation, when choosing delegation target.

### Fixed

-   Fixed an issue that made it impossible to create a transaction to do passive delegation.
-   Fixed issue that caused the wallet to crash when inspecting identities with missing date attributes, again.

## 1.4.0

### Added

-   Added logging, which can be exported from the application menu.
-   Added support for the register data transaction.
-   Allow users to verify address on Ledger device.
-   Allow users to choose CCD or microCCD as the unit used in account report.
-   Dedicated spaces to baking/delegating in accounts section.
-   New flows for configuring account as baker, which will be effective when the node is updated to protocol version 4.
-   Flows for configuring delegation of stake for accounts, which will be effective when the node is updated to protocol version 4.
-   Support for chain updates added in protocol version 4 (Cooldown, Pool and Time parameters).
-   Support for chain updates that are changed in protocol version 4 (Mint distribution and level2 key updates).
-   Support for new reward types introduced with delegation in transaction list and account export.
-   Display transaction events when a single transaction is selected (Transaction view).

### Changed

-   Flows for pre-delegation baker transactions will be unavailable when protocol version 4 is activated on the node.
-   Updated account views to include delegated stake.
-   Moved flows for updating baker configuration in newly added baking section.
-   Grouped all rewards under a single checkbox in transactions filter.
-   Transaction filters are now accessible from account list view (on transaction log tab "Filters").
-   Account address is accessible from new "Receive" button.
-   Various UI updates to "Accounts" page.

## 1.3.1

### Fixed

-   Fixed issue that caused the wallet to crash when inspecting identities with missing date attributes.
-   Fixed identity issuance with dts.

## 1.3.0

### Added

-   Added a GTU drop option for testnet and stagenet.
-   In the case of a failed identity, the error details received from the identity provider are now displayed to the user.
-   UI flows for baker transactions for single signer accounts.

### Changed

-   Auxiliary data in an Update Protocol transaction is now optional.
-   Updated terms and conditions.
-   Updated UI to reflect the rename of GTU to CCD, meaning anywhere tokens were referred to as GTU, it now says CCD. The GTU icon has also been replaced with the icon representing CCD.
-   Datetimes are now selected with a date picker from a calendar.
-   Finalized transactions are no longer stored in the local database, but are instead always fetched from the wallet proxy when needed.
-   Updated the default node configuration to point to concordiumwalletnode.com.

### Fixed

-   Failed database migrations errors are now shown correctly to the user.

## 1.2.0

### Added

-   Support for macOS running on M1 chipsets through Rosetta.
-   It is now possible to view an account address QR-code in "fullscreen" mode.
-   It is now possible to rename accounts and identities.
-   Added an option to add an address book entry while creating a transfer transaction.
-   Added an introductory screen to set up a node connection for first time users.
-   Now shows connected node status in side bar.
-   It is now possible to remove a failed identity.
-   Added reference (sessionId) on failed identities, for support.
-   Added support for memo transactions.
-   Added algorithm to recover lost accounts and credentials.
-   Application will automatically search for updates and prompt the user to download and install them (Windows, macOS and AppImage for Linux).
-   It is now possible to set a default account, which will be selected initially when opening the app.
-   "About" menu link has been added to native menu bar under "Help" for windows/linux. It is already accessible on mac under "Concordium desktop wallet" in the native menu.
-   When an account is synchronizing transactions, it now shows with a spinning icon in the tab header of the transaction log.
-   Added flows to make baker transactions from accounts with only one set of credentials possible without going through a multi-signature proposal flow.

### Changed

-   The native menu bar has been updated to only contain relevant items. Terms and conditions and the license notices have been moved to the menu bar. The menu bar is now accessible on Windows and Linux. Press
-   The accounts page has been updated to make it clearer that multi credential accounts are not able to use shielded transactions.
-   Transactions in the 'Transfers' list in the account view are now grouped by dates.
-   Account page has changed, now featuring two different ways to view accounts: a simple, quick overview of all accounts, and a detailed view of a single account. All actions previously found under "More" will now be found in "detailed view" for the specific account.
-   Account page can be viewed in its entirety (though with limited use) without being connected to a node.

### Fixed

-   A number of smaller bugs have been fixed.

## 1.1.6 - 2021-07-28

### Fixed

-   Fixed an issue where identity creation would fail consistently, making it impossible to create new identities.

## 1.1.5 - 2021-07-27

### Added

-   Wallet exports now contain the genesis hash to prevent the import of a wallet from testnet to a mainnet wallet.
-   Transaction status is now included in an account report.
-   Foundation feature for importing and creating multi signature transactions in bulk.

### Changed

-   General improvements to the user interface, in particular for multi signature transaction flows.
-   Improved messages when waiting for a Ledger device to be connected.

### Fixed

-   Change of wallet password now enforces the same length restriction as when initially set.
-   Fixed an issue where e.g. a loss of connection could result in a failed identity when it should not.
-   Security improvements. Node integration was available to the Electron renderer threads which is considered unsafe. This has now been disabled.
-   A number of bug have been fixed.
