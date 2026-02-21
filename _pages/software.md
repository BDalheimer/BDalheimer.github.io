---
title: "Software"
layout: gridlay
sitemap: false
permalink: /software/
---

<style>
img{
  border-radius: 10px;
}
iframe {
  width: 175px;
  display: inline;
  vertical-align:middle;
  <!-- margin-bottom:5px; -->
  <!-- margin-left:5px; -->
  <!-- border: 1px solid red; -->
}
.col-md-3 {
  margin:0;
  padding:0;
  margin-top:10px;
  margin-bottom:10px;
  display:block;
  overflow:hidden;
  text-align:center;
  display: table-cell;
  height: auto;
  float: none;
  background:white;
  border-radius:20px;
  <!-- border: 1px solid black; -->
}
</style>

### SVARS

The R package [svars](https://cran.r-project.org/web/packages/svars/index.html) implements 6 data-driven identification methods for structural vector autoregressive (SVAR) models. 
Have a look at the project on [Github](https://github.com/alexanderlange53/svars) or visit the info page on [CRAN](https://cran.r-project.org/web/packages/svars/index.html).
The publication in the *Journal of Statistical Software* can be found [here](https://www.jstatsoft.org/article/view/v097i05/0).
<div class="container">
<div class="row">
<center>
<img src="{{ site.url }}{{ site.baseurl }}/images/sticker_svars.png" width="50%"/><br/>
</center>
</div>
</div>



<div class="jumbotron">
<div class="row align-items-end">
<div class="col-md-12 col-sm-12">
<h4><b>Papers that</b></h4>
<a href="https://example.com" target="_blank"><button class="btn btn-success btn-sm">WEBSITE</button></a>
<a href="https://github.com" target="_blank"><button class="btn btn-info btn-sm">GIT</button></a>
<a href="{{ site.url }}{{ site.baseurl }}/papers/example_proceeding.pdf" target="_blank"><button class="btn btn-danger btn-sm">PAPER</button></a> 

<b>Authors:</b>
<i>Alexander Lange, Bernhard Dalheimer, Simone Maxand, Helmut Herwartz</i>

Implements data-driven identification methods for structural vector autoregressive (SVAR) models as described in [Lange et al. (2021)](https://doi:10.18637/jss.v097.i05). Based on an existing VAR model object (provided by e.g. VAR() from the 'vars' package), the structural impact matrix is obtained via data-driven identification techniques (i.e. changes in volatility [Rigobon, R. (2003)](https://direct.mit.edu/rest/article-abstract/85/4/777/57415/Identification-Through-Heteroskedasticity?redirectedFrom=fulltext)), patterns of GARCH ([Normadin, M., Phaneuf, L., 2004](doi:10.1016/j.jmoneco.2003.11.002)), independent component analysis (Matteson, D. S, Tsay, R. S., (2013) <doi:10.1080/01621459.2016.1150851>), least dependent innovations (Herwartz, H., Ploedt, M., (2016) <doi:10.1016/j.jimonfin.2015.11.001>), smooth transition in variances (Luetkepohl, H., Netsunajev, A. (2017) <doi:10.1016/j.jedc.2017.09.001>) or non-Gaussian maximum likelihood (Lanne, M., Meitz, M., Saikkonen, P. (2017) <doi:10.1016/j.jeconom.2016.06.002>)).

</div>
</div>
</div>
