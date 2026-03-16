import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:share_plus/share_plus.dart';

class FiinnyBusinessScreen extends StatefulWidget {
  const FiinnyBusinessScreen({super.key});

  @override
  State<FiinnyBusinessScreen> createState() => _FiinnyBusinessScreenState();
}

class _FiinnyBusinessScreenState extends State<FiinnyBusinessScreen> {
  late final WebViewController _controller;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0x00000000))
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (int progress) {
            // Update loading bar if needed
          },
          onPageStarted: (String url) {},
          onPageFinished: (String url) {
            if (mounted) {
              setState(() {
                _isLoading = false;
              });
            }
          },
          onWebResourceError: (WebResourceError error) {},
        ),
      )
      ..loadRequest(Uri.parse('https://karanarjun-pvt-ltd.web.app/'));
  }

  void _shareAppLinks() {
    const String shareText = '''
Check out Fiinny! Manage expenses, split money, and more.

🌐 Website: https://fiinny.com/
📱 Android: https://play.google.com/store/apps/details?id=com.KaranArjunTechnologies.lifemap
🍎 iOS: https://apps.apple.com/in/app/fiinny-expense-split-money/id6751309482
''';
    Share.share(shareText);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Fiinny Business',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black87,
        elevation: 1,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => Navigator.of(context).pop(),
          tooltip: 'Back to Personal',
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.share_rounded),
            color: Colors.blueAccent,
            tooltip: 'Share Fiinny',
            onPressed: _shareAppLinks,
          ),
        ],
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_isLoading)
            const Center(
              child: CircularProgressIndicator(),
            ),
        ],
      ),
    );
  }
}
