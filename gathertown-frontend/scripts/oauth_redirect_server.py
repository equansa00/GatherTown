from flask import Flask, request, render_template_string

app = Flask(__name__)

@app.route('/oauth/callback')
def oauth_callback():
    html_content = '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>OAuth Callback</title>
    </head>
    <body>
        <h1>OAuth Callback</h1>
        <p>Extracting OAuth token...</p>
        <script>
            // Extract the token from the fragment part of the URL
            const fragment = window.location.hash.substring(1);
            const params = new URLSearchParams(fragment);
            const token = params.get('access_token');
            
            if (token) {
                // Send the token to the server
                fetch('/store_token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token: token })
                }).then(response => response.text())
                  .then(data => {
                      document.body.innerHTML = `<p>${data}</p>`;
                  });
            } else {
                document.body.innerHTML = '<p>No OAuth token received</p>';
            }
        </script>
    </body>
    </html>
    '''
    return render_template_string(html_content)

@app.route('/store_token', methods=['POST'])
def store_token():
    data = request.get_json()
    token = data.get('token')
    if token:
        print(f"OAuth Token: {token}")
        return f"OAuth Token: {token}"
    else:
        return "No OAuth token received", 400

if __name__ == "__main__":
    app.run(port=5000)
