/**
 * Backup (infra): Export, import and transfer of all data between devices.
 *
 * Still in legacy.js, proposed to move here (7 named pieces, 4.0 KB):
 *   buildBackup, exportData, parseBackup, applyBackup, impMode, pickImport, importFile
 */
class Backup {
  /** all data as one object */
  static build() { Pending.method('Backup.build'); }
  static exportFile() { Pending.method('Backup.exportFile'); }
  /** validates a backup */
  static parse(text) { Pending.method('Backup.parse'); }
  /** replace or merge */
  static apply(backup, mode) { Pending.method('Backup.apply'); }
}
