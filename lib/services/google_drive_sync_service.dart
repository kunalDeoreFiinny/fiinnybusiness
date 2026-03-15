import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:googleapis/drive/v3.dart' as drive;
import 'package:http/http.dart' as http;
import 'package:http/io_client.dart';
import 'package:path/path.dart' as p;
import 'package:sqflite/sqflite.dart';

class GoogleAuthClient extends http.BaseClient {
  final Map<String, String> _headers;
  final http.Client _client = IOClient(HttpClient());

  GoogleAuthClient(this._headers);

  @override
  Future<http.StreamedResponse> send(http.BaseRequest request) {
    return _client.send(request..headers.addAll(_headers));
  }
}

class GoogleDriveSyncService {
  final _googleSignIn = GoogleSignIn(
    scopes: [
      drive.DriveApi.driveAppdataScope, // App Data Folder
      drive.DriveApi.driveFileScope,
    ],
  );

  Future<drive.DriveApi?> _getDriveApi() async {
    final account = await _googleSignIn.signIn();
    if (account == null) return null;

    final authHeaders = await account.authHeaders;
    final client = GoogleAuthClient(authHeaders);
    return drive.DriveApi(client);
  }

  Future<bool> backupDatabase() async {
    try {
      final api = await _getDriveApi();
      if (api == null) return false;

      final dbPath = await getDatabasesPath();
      final path = p.join(dbPath, 'fiinny_b2b.db');
      final file = File(path);

      if (!await file.exists()) {
        debugPrint('[DriveSync] No database to backup.');
        return false;
      }

      final media = drive.Media(file.openRead(), file.lengthSync());
      final driveFile = drive.File()
        ..name = 'fiinny_b2b_backup.db'
        ..parents = ['appDataFolder'];

      // Check if backup already exists
      final fileList = await api.files.list(
        spaces: 'appDataFolder',
        q: "name='fiinny_b2b_backup.db'",
      );

      if (fileList.files != null && fileList.files!.isNotEmpty) {
        final fileId = fileList.files!.first.id!;
        await api.files.update(driveFile, fileId, uploadMedia: media);
        debugPrint('[DriveSync] Backup updated successfully.');
      } else {
        await api.files.create(driveFile, uploadMedia: media);
        debugPrint('[DriveSync] Backup created successfully.');
      }

      return true;
    } catch (e) {
      debugPrint('[DriveSync] Backup failed: $e');
      return false;
    }
  }

  Future<bool> restoreDatabase() async {
    try {
      final api = await _getDriveApi();
      if (api == null) return false;

      final fileList = await api.files.list(
        spaces: 'appDataFolder',
        q: "name='fiinny_b2b_backup.db'",
      );

      if (fileList.files == null || fileList.files!.isEmpty) {
        debugPrint('[DriveSync] No backup found to restore.');
        return false;
      }

      final fileId = fileList.files!.first.id!;
      final drive.Media response = await api.files.get(
        fileId,
        downloadOptions: drive.DownloadOptions.fullMedia,
      ) as drive.Media;

      final dbPath = await getDatabasesPath();
      final path = p.join(dbPath, 'fiinny_b2b.db');
      final file = File(path);

      final List<int> bytes = [];
      await for (var data in response.stream) {
        bytes.addAll(data);
      }
      await file.writeAsBytes(bytes);

      debugPrint('[DriveSync] Database restored successfully.');
      return true;
    } catch (e) {
      debugPrint('[DriveSync] Restore failed: $e');
      return false;
    }
  }

  Future<void> signOut() async {
    await _googleSignIn.signOut();
  }
}
