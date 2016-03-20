  set :build_dir, 'builder'
  # Use relative links
  set :relative_links, true
  # Use relative asset pipelineURLs
  activate :relative_assets

  configure :build do

    ignore '*.sass'

  end

  set :css_dir, 'dist/css'

  set :js_dir, 'dist/js'

  set :images_dir, 'images'

###
# Page options, layouts, aliases and proxies
###

# Per-page layout changes:
#
# With no layout
page '/*.xml', layout: false
page '/*.json', layout: false
page '/*.txt', layout: false

# With alternative layout
# page "/path/to/file.html", layout: :otherlayout

# Proxy pages (http://middlemanapp.com/basics/dynamic-pages/)
# proxy "/this-page-has-no-template.html", "/template-file.html", locals: {
#  which_fake_page: "Rendering a fake page with a local variable" }

# General configuration

###
# Helpers
###

# Methods defined in the helpers block are available in templates
# helpers do
#   def some_helper
#     "Helping"
#   end
# end


# Gulp.js external pipeline
activate :external_pipeline,
  name: :gulp,
  latency: 0,
  command: build? ? './node_modules/gulp/bin/gulp.js buildProd' : './node_modules/gulp/bin/gulp.js default',
  source: ".tmp/dist"
