# Changelog

## Unreleased

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

### Changed

-   The native menu bar has been updated to only contain relevant items. Terms and conditions and the license notices have been moved to the menu bar. The menu bar is now accessible on Windows and Linux. Press
-   The accounts page has been updated to make it clearer that multi credential accounts are not able to use shielded transactions.
-   Transactions in the 'Transfers' list in the account view are now grouped by dates.

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
