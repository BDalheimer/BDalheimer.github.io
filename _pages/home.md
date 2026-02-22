---
title: "Home"
layout: homelay
sitemap: false
permalink: /
---

### Welcome!

I an Assistant Professor of Macroeconomics and Trade at the Department of Agricultural Economics at Purdue University. I currently focus on uncertainty in international trade and global agri-food value chains, agricultural market shocks, and socio-environmental trade-offs in agricultural production systems. My research often has policy focus and features data-science approaches.

You can find my full list of publications on [Google Scholar](https://scholar.google.de/citations?user=sBxpsF8AAAAJ&hl=de), 
download my [CV]({{ site.url }}{{ site.baseurl }}/cv/CVonline.pdf), or visit my 
[YouTube channel](https://www.youtube.com/channel/UCRgmIYjSsUOJIoXQwQUqpmQ) where I post AI-generated non-technical 
summaries of my research papers.

### About me

I joined the Department of Agricultural Economics of Purdue University in August 2023. My research focuses on the economics of international agricultural/food supply chains and trade under uncertainty. For instance, how Global Value Chain (GVC) participation in agriculture relates to consumer and producer welfare, and how regulation affects input sourcing of agri-food firms.

Before joining Purdue, I was a Visiting Fellow at the University of Minnesota, a Professor ad Interim at the University of Kiel, and a Postdoc at the University of Göttingen, where my work focused on measuring environmental performance of food production systems, agricultural market analysis, and statistical software development in causal time series analysis.

In assignments outside of academia, I designed Food Balance Sheet imputation methodologies at the Food and Agricultural Organization of the United Nations (FAO), developed trade- mode prediction models at the United Nations Conference for Trade and Development (UNCAD), gauged a hypothetical EU-Africa trade agreement at the German association for cooperation and Development (GIZ), and used remote sensing to estimate the global potential of sustainable biofuel production on marginal land for aprivate sector company (VWP).




{% if site.data.grants %}

<div class="jumbotron">
  <h3>Employment</h3>
  <ul>
    {% for grant in site.data.grants %}
      <li>{{ grant.name }}</li>
    {% endfor %}
  </ul>
</div>
{% endif %}

{% if site.data.awards %}

<div class="jumbotron">
  <h3>Non-acadmic assignemnts</h3>
  <ul>
    {% for award in site.data.awards %}
      <li>{{ award.name | replace: "-","&#8211;" }}</li>
    {% endfor %}
  </ul>
</div>
{% endif %}