---
layout: base
title: Home
---

<details name="about">
  <summary>About the Toronto Communities Directory Pilot</summary>
  <p>This is a lightweight directory of Toronto's various communities. It is intended to facilitate the discovery of communities in Toronto and serve as an example of community centred data.</p> 
  <p>Currently in early development, the data structure and directory content will be evolving as requirements and insights emerge.</p> 
  <p>This initiative is an open collaboration. You are welcome to contribute. To get involved or learn more please come to Civic Tech Toronto's hacknights on Tuesday evenings, or 1RG's monthly Civic Sundays.</p>
  <p>For ease of access you can get the directory in <code>JSON</code> or <code>CSV</code> formats from the following:</p>
  <ul>
  <li><a href="{{"/all.csv" | relative_url }}">all.csv</a></li>
  <li><a href="{{"/all.json" | relative_url }}">all.json</a></li>
  </ul>
</details>
<hr/>
<details name="additions">
  <summary>Make an addition</summary>

<p>Add or edit entries:</p>
<ol>
<li>by using the <a href="https://github.com/CivicTechTO/toronto-community-directory/issues/new?template=add_community.yml
">add a community</a> issue form template on github.</li>
<li>by including a record in <code>_communities</code> on <a href="https://github.com/CivicTechTO/toronto-community-directory">CivicTechTO/toronto-community-directory</a>.</li>
<li>tell Jordy in person at Civic Tech Toronto on Tuesday nights.</li>
</ol>
</details>
<hr/>

{% assign all_tags = site.communities | map: "tags" | compact | join: "," | split: "," | uniq | sort %}

{% assign top_namespaces = '' | split: '' %}
{% for tag in all_tags %}
{% assign trimmed_tag = tag | strip %}
{% if trimmed_tag contains '/' %}
{% assign namespace = trimmed_tag | split: '/' | first %}
{% unless top_namespaces contains namespace %}
{% assign top_namespaces = top_namespaces | push: namespace %}
{% endunless %}
{% endif %}
{% endfor %}
{% assign top_namespaces = top_namespaces | sort %}

<details name="filters" open>
  <summary>Filter Controls</summary>
  <div id="filter-controls">
    <div class="filter-header">
      <div class="filter-actions">
        <button class="filter-btn filter-all active" data-filter="all">Show All</button>
        <button class="filter-clear" id="clear-filters" style="display: none;">Clear Filters</button>
      </div>
      <button id="filter-mode-toggle" class="filter-mode-btn" role="button">
        <span class="mode-label">Mode:</span>
        <span class="mode-value">OR (ANY)</span>
      </button>
    </div>

    <div class="active-filters" id="active-filters" style="display: none;">
      <span class="active-filters-label">Active filters:</span>
      <div class="active-filters-list"></div>
    </div>

    <div class="filter-categories">
      {% for namespace in top_namespaces %}
        <details class="filter-category" data-namespace="{{ namespace }}">
          <summary class="category-header">
            <span class="category-icon">▸</span>
            <span class="category-name">{{ namespace | replace: '-', ' ' | capitalize }}</span>
            <span class="category-count"></span>
          </summary>
          <div class="filter-tree">
            {% assign namespace_tags = '' | split: '' %}
            {% for tag in all_tags %}
              {% assign trimmed_tag = tag | strip %}
              {% assign tag_namespace = trimmed_tag | split: '/' | first %}
              {% if tag_namespace == namespace %}
                {% assign namespace_tags = namespace_tags | push: trimmed_tag %}
              {% endif %}
            {% endfor %}

            {% assign all_paths = '' | split: '' %}
            {% for tag in namespace_tags %}
              {% assign parts = tag | split: '/' %}
              {% assign cumulative_path = namespace %}

              {% for i in (1..10) %}
                {% if i < parts.size %}
                  {% assign part = parts[i] %}
                  {% assign cumulative_path = cumulative_path | append: '/' | append: part %}
                  {% unless all_paths contains cumulative_path %}
                    {% assign all_paths = all_paths | push: cumulative_path %}
                  {% endunless %}
                {% endif %}
              {% endfor %}
            {% endfor %}
            {% assign all_paths = all_paths | sort %}

            {% assign current_depth = -1 %}
            {% for path in all_paths %}
              {% assign parts = path | split: '/' %}
              {% assign depth = parts.size | minus: 1 %}
              {% assign label = parts | last %}

              {% if depth != current_depth %}
                {% if current_depth >= 0 %}
                  </div>
                {% endif %}
                <div class="tree-group" data-depth="{{ depth }}">
              {% endif %}
              {% assign current_depth = depth %}

              <button class="filter-btn tree-node"
                      data-filter="{{ path }}"
                      data-filter-prefix="{{ path }}/"
                      data-namespace="{{ namespace }}"
                      data-depth="{{ depth }}"
                      title="{{ path }}">
                <span class="tag-label">{{ label | replace: '-', ' ' }}</span>
              </button>
            {% endfor %}
            {% if current_depth >= 0 %}
              </div>
            {% endif %}
          </div>
        </details>
      {% endfor %}

      {% assign unnamespaced_tags = '' | split: '' %}
      {% for tag in all_tags %}
        {% assign trimmed_tag = tag | strip %}
        {% unless trimmed_tag contains '/' %}
          {% assign unnamespaced_tags = unnamespaced_tags | push: trimmed_tag %}
        {% endunless %}
      {% endfor %}

      {% if unnamespaced_tags.size > 0 %}
        <details class="filter-category" data-namespace="other">
          <summary class="category-header">
            <span class="category-icon">▸</span>
            <span class="category-name">Other Tags</span>
            <span class="category-count"></span>
          </summary>
          <div class="filter-tree">
            <div class="tree-group" data-depth="0">
              {% for tag in unnamespaced_tags %}
                <button class="filter-btn tree-node" data-filter="{{ tag }}" data-depth="0" title="{{ tag }}">
                  <span class="tag-label">{{ tag | replace: '-', ' ' }}</span>
                </button>
              {% endfor %}
            </div>
          </div>
        </details>
      {% endif %}
    </div>

  </div>
</details>

<div class="results-summary">
  <span id="results-count"></span>
</div>

<div class="grid-upgrade">
  {% assign sorted = site.communities | sort: "name" %}
  {% for c in sorted %}
    {% include card.html c=c %}
  {% endfor %}
</div>

<hr/>
