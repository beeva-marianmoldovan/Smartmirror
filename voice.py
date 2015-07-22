import wit, cherrypy, cherrypy_cors
cherrypy_cors.install()
access_token = ''
class WitAi(object):
	@cherrypy.expose
	def index(self):
		wit.init()
		response = wit.voice_query_auto(access_token)
		cherrypy.response.headers['Access-Control-Allow-Origin'] = '*' #
		cherrypy.response.headers['Content-Type'] = 'application/json'
		wit.close()
		return response

if __name__ == '__main__':
	conf = { '/': { 'tools.response_headers.headers': [('Content-Type', 'application/json')]}}
	cherrypy.quickstart(WitAi(), '/', conf)
