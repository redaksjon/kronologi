Please analyze the following monthly email content and create a summary of the emails received and sent in the month {{parameters.month}}/{{parameters.year}}.

Use the provided context to enhance the analysis.

The email data will be presented as text files that adhere to the following structure:

    Subject: <message subject>
    Date: <date received or sent>
    From: <from email address>
    To: <one or more recipients>

    <message body>


The output format should adhere to the following Markdown:

    # Email Summary for <month> <year>

    ## Email Summary for <owner>>/<reposiory> in <month> <year>
    Total emails in <owner>>/<reposiory> for <month> <year>: <total emails>

    - Emails Received: <number of emails received>
    - Emails Sent: <number of emails sent>

    <content generated>

EVERY header must contain the terms "Emails in <month> <year>" - for example, if there is a header for an "Overview" it should be "Overview of Emails in <month> <year>".   Or if there is a header, "Analysis of Technology Trends" it should be "Analysis of Technology Trends in Emails in <month> <year>".  It is important for the headers to be explicit because the output may be combined with data from other months.

In the context, there will be two types of files - files from "received" are the emails that were received, and emails in "sent" are the emails that were sent.

# Guidance for Analysis 

This analysis is looking for trends related to the activity for issues in the array of projects that have been presented.   

Try to identify relationships between emails and identify important emails senders.


